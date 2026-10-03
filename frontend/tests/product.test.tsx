import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { WalletContext, type Provider } from '../src/wallet';
import { unavailableAdapter, type Charter, type ContractAdapter, type Proposal } from '../src/adapter';

// Test-only canonical response doubles. Never bundled into the product.
const a = '0x1111111111111111111111111111111111111111';
const b = '0x2222222222222222222222222222222222222222';
const c = '0x3333333333333333333333333333333333333333';
const charter: Charter = { id:'CD-test',title:'Shared dataset charter',phase:'DRAFT',version:1,digest:'baseline-digest',deadline:2100000000,members:[{id:'A',address:a,terms:'A may read the shared dataset.',ratified:true},{id:'B',address:b,terms:'B may redistribute the dataset.',ratified:false},{id:'C',address:c,terms:'C must publish attribution.',ratified:false}],active_proposal:'AM-test',proposal_ids:['AM-test'] };
const proposal: Proposal = { id:'AM-test',charter_id:charter.id,phase:'CONSENT_REQUIRED',proposer:a,base_version:1,old_terms:charter.members.map(m=>m.terms),new_terms:['A may read the shared dataset.','B may redistribute only after paying a fee.','C must publish attribution.'],digest:'proposal-digest',deadline:2100000000,coverage:[{member_id:'A',impact:'PRESERVED'},{member_id:'B',impact:'MATERIAL_CHANGE'},{member_id:'C',impact:'PRESERVED'}],required:['B'],approved:[],attempt_count:1,locked_gen:2 };
function adapter(actions: string[]): ContractAdapter {
  return { configured:true,list:vi.fn(async()=>[charter]),charter:vi.fn(async()=>charter),proposal:vi.fn(async()=>proposal),actions:vi.fn(async()=>actions),credits:vi.fn(async()=>[{charter_id:charter.id,title:charter.title,amount_gen:2}]),write:vi.fn(async(_m,_args,_v,progress)=>{progress({stage:'Submitted',hash:'0xabc'});progress({stage:'Accepted',hash:'0xabc'});progress({stage:'Finalized',hash:'0xabc'});}) };
}
function setup(route: string, api=unavailableAdapter) {
  const provider: Provider = {request:vi.fn(async({method})=>method === 'eth_chainId' ? '0xf22d' : method === 'wallet_switchEthereumChain' ? null : [b]),isMetaMask:true}; window.ethereum=provider;
  window.scrollTo=vi.fn();
  render(<MemoryRouter initialEntries={[route]}><WalletContext><App adapter={api}/></WalletContext></MemoryRouter>);
  return provider;
}
async function connect() {
  fireEvent.click(screen.getAllByRole('button',{name:'Connect wallet'})[0]);
  const dialog=screen.getByRole('dialog'); fireEvent.click(within(dialog).getByRole('button',{name:/MetaMask/}));
  await waitFor(()=>expect(screen.getAllByRole('button',{name:/0x2222/}).length).toBeGreaterThan(0));
}
describe('complete product routes and honest states',()=>{
  it('restores only the previously chosen and already-authorized wallet without a permission prompt',async()=>{
    localStorage.setItem('consent-delta:wallet-choice',JSON.stringify({id:'injected-0',name:'MetaMask'}));
    const p=setup('/account',adapter([]));
    await screen.findByRole('button',{name:'Disconnect this wallet'});
    expect(p.request).toHaveBeenCalledWith({method:'eth_accounts'});
    expect(p.request).not.toHaveBeenCalledWith({method:'eth_requestAccounts'});
  });
  it('remembers only a harmless provider choice and removes it on logout',async()=>{
    setup('/account',adapter([]));await connect();
    expect(JSON.parse(localStorage.getItem('consent-delta:wallet-choice')!)).toEqual({id:'injected-0',name:'MetaMask'});
    fireEvent.click(screen.getByRole('button',{name:'Disconnect this wallet'}));
    expect(localStorage.getItem('consent-delta:wallet-choice')).toBeNull();
  });
  it('connects all persistent navigation destinations from the value-first entry',()=>{setup('/');expect(screen.getByRole('heading',{name:/Keep consent intact/})).toBeTruthy();expect(screen.getByRole('navigation').textContent).toContain('Charters');expect(screen.getByRole('link',{name:'Create a charter'}).getAttribute('href')).toBe('/charters/new');expect(screen.getByText(/No on-chain records or transactions/)).toBeTruthy();});
  it.each(['/charters','/charters/CD-test','/charters/CD-test/amend','/charters/CD-test/proposals/AM-test','/account'])('does not invent canonical records at %s',(route)=>{setup(route);expect(screen.getByText(/No on-chain records or transactions/)).toBeTruthy();expect(screen.queryByText('Shared dataset charter')).toBeNull();});
  it('shows useful supporting help and a recoverable unknown route',()=>{setup('/help');expect(screen.getByRole('heading',{name:'How consent works'})).toBeTruthy();expect(screen.getByRole('heading',{name:'What happens to the GEN?'})).toBeTruthy();});
  it('requests only the wallet explicitly selected by the user and disconnects',async()=>{const p=setup('/account',adapter([]));fireEvent.click(screen.getAllByRole('button',{name:'Connect wallet'})[0]);expect(p.request).not.toHaveBeenCalled();fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:/MetaMask/}));await waitFor(()=>expect(p.request).toHaveBeenCalledWith({method:'eth_requestAccounts'}));fireEvent.click(await screen.findByRole('button',{name:'Disconnect this wallet'}));expect(screen.getAllByRole('button',{name:'Connect wallet'}).length).toBeGreaterThan(0);});
  it('prepares exact initial terms across two real screens without pretending submission',()=>{setup('/charters/new');fireEvent.change(screen.getByLabelText('Charter title'),{target:{value:'Shared terms'}});fireEvent.change(screen.getByLabelText("Member B's wallet"),{target:{value:b}});fireEvent.change(screen.getByLabelText("Member C's wallet"),{target:{value:c}});for(const id of ['A','B','C'])fireEvent.change(screen.getByLabelText(`Member ${id}'s terms`),{target:{value:`Member ${id} may access the agreed dataset.`}});fireEvent.click(screen.getByRole('button',{name:'Review initial terms'}));expect(screen.getByRole('heading',{name:'Review your initial charter'})).toBeTruthy();expect((screen.getByRole('button',{name:'Sign and create charter'}) as HTMLButtonElement).disabled).toBe(true);fireEvent.click(screen.getByRole('button',{name:'Edit terms'}));expect((screen.getByLabelText('Charter title') as HTMLInputElement).value).toBe('Shared terms');});
  it('filters canonical charter results without creating substitute data',async()=>{const api=adapter([]);setup('/charters',api);await connect();expect(await screen.findByText(charter.title)).toBeTruthy();fireEvent.change(screen.getByLabelText('Search by title'),{target:{value:'absent'}});expect(screen.getByRole('heading',{name:'No matching charters'})).toBeTruthy();expect(api.list).toHaveBeenCalledWith(b);});
  it('offers recovery for a failed canonical read',async()=>{const api=adapter([]);api.charter=vi.fn(async()=>{throw new Error('network failure');});setup('/charters/CD-test',api);expect(await screen.findByText(/records could not be loaded/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Try loading again'}));await waitFor(()=>expect(api.charter).toHaveBeenCalledTimes(2));});
});
describe('contextual lifecycle controls retain exact bindings and reload canonical state',()=>{
  it('creates the reviewed charter through its wrapper and reloads the resulting detail',async()=>{const api=adapter([]);setup('/charters/new',api);await connect();fireEvent.change(screen.getByLabelText('Charter title'),{target:{value:'Shared terms'}});fireEvent.change(screen.getByLabelText("Member B's wallet"),{target:{value:a}});fireEvent.change(screen.getByLabelText("Member C's wallet"),{target:{value:c}});const terms=['A may read the dataset.','B may redistribute the dataset.','C must publish attribution.'];for(const [i,id]of ['A','B','C'].entries())fireEvent.change(screen.getByLabelText(`Member ${id}'s terms`),{target:{value:terms[i]}});fireEvent.click(screen.getByRole('button',{name:'Review initial terms'}));fireEvent.click(screen.getByRole('button',{name:'Sign and create charter'}));await waitFor(()=>expect(api.write).toHaveBeenCalledWith('create_charter',[expect.stringMatching(/^CD-/),'Shared terms',a,c,...terms,expect.any(Number)],0,expect.any(Function)));await waitFor(()=>expect(api.charter).toHaveBeenCalled());});
  it('submits complete replacement terms bound to current version and exactly 2 GEN',async()=>{const api=adapter(['amend']);api.charter=vi.fn(async()=>({...charter,phase:'ACTIVE' as const,active_proposal:''}));setup('/charters/CD-test/amend',api);await connect();const terms=charter.members.map(m=>m.terms);terms[1]='B may redistribute only after paying a fee.';await waitFor(()=>expect((screen.getByLabelText("Member B's terms")as HTMLTextAreaElement).value).toContain('redistribute'));fireEvent.change(screen.getByLabelText("Member B's terms"),{target:{value:terms[1]}});fireEvent.click(await screen.findByRole('button',{name:'Review proposed terms'}));fireEvent.click(screen.getByRole('button',{name:'Sign and lock 2 GEN'}));await waitFor(()=>expect(api.write).toHaveBeenCalledWith('propose_amendment',['CD-test',expect.stringMatching(/^AM-/),1,'baseline-digest',...terms,expect.any(Number)],2,expect.any(Function)));await waitFor(()=>expect(api.proposal).toHaveBeenCalled());});
  it.each([
    ['ratify','/charters/CD-test','Approve initial terms','ratify',['CD-test','baseline-digest']],
    ['review','/charters/CD-test/proposals/AM-test','Request impact review','review',['CD-test','AM-test']],
    ['consent','/charters/CD-test/proposals/AM-test','Approve these exact terms','consent',['CD-test','AM-test','proposal-digest']],
    ['reject','/charters/CD-test/proposals/AM-test','Decline the amendment','reject',['CD-test','AM-test','proposal-digest']],
    ['expire','/charters/CD-test/proposals/AM-test','Recover expired purse','expire',['CD-test','AM-test']],
    ['expire_charter','/charters/CD-test','Close expired charter','expire_charter',['CD-test']],
    ['withdraw','/account','Withdraw credit','withdraw',['CD-test']],
  ])('%s uses the exact canonical target and refreshes after finality',async(action,route,label,method,args)=>{const api=adapter([action]);setup(route,api);await connect();fireEvent.click(await screen.findByRole('button',{name:label}));await waitFor(()=>expect(api.write).toHaveBeenCalledWith(method,args,0,expect.any(Function)));expect(await screen.findByText('Action finalized. Current records refreshed.')).toBeTruthy();});
  it('hides affected consent and refusal from an ineligible member',async()=>{setup('/charters/CD-test/proposals/AM-test',adapter([]));await connect();await screen.findByText('Consent required');expect(screen.queryByRole('button',{name:'Approve these exact terms'})).toBeNull();expect(screen.queryByRole('button',{name:'Decline the amendment'})).toBeNull();});
  it('shows retry only from canonical retry state',async()=>{const api=adapter(['review']);api.proposal=vi.fn(async():Promise<Proposal>=>({...proposal,phase:'RETRYABLE'}));setup('/charters/CD-test/proposals/AM-test',api);await connect();fireEvent.click(await screen.findByRole('button',{name:'Try impact review again'}));await waitFor(()=>expect(api.write).toHaveBeenCalledWith('review',['CD-test','AM-test'],0,expect.any(Function)));});
  it('does not convert a failed write into optimistic canonical success',async()=>{const api=adapter(['consent']);api.write=vi.fn(async()=>{throw new Error('rejected');});setup('/charters/CD-test/proposals/AM-test',api);await connect();fireEvent.click(await screen.findByRole('button',{name:'Approve these exact terms'}));expect(await screen.findByText(/action did not complete/)).toBeTruthy();expect(screen.queryByText('Action finalized. Current records refreshed.')).toBeNull();});
});
