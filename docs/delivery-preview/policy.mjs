// LOCAL PROPOSAL ONLY. Never imported by the storefront or payment gateway.
// Amounts are display estimates from the approved brief, not server quotations.
export function quote({tier=2,currency='INR',speed='standard',emailRsvp=false}) {
  if(![2,3,4].includes(tier)||!['INR','USD'].includes(currency))throw Error('Invalid package or currency');
  if(!['standard','express24','express12'].includes(speed))throw Error('Select exactly one delivery speed');
  const actual=speed;
  const base=currency==='INR'?({2:1999,3:2999,4:4999}[tier]):({2:29,3:45,4:75}[tier]);
  const delivery=currency==='INR'?({standard:0,express24:799,express12:1499}[actual]):({standard:0,express24:9,express12:18}[actual]);
  const rsvp=tier===4?0:emailRsvp?(currency==='INR'?2000:24):0;
  return {speed:actual,hours:{standard:48,express24:24,express12:12}[actual],delivery,rsvp,total:base+delivery+rsvp,emailRsvp:tier===4||emailRsvp};
}
export function switchCurrency(selection,currency){
  // Match the storefront: currency changes reset the displayed choice to standard.
  return {...selection,currency,speed:'standard'};
}
