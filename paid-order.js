/* Shared receipt and WhatsApp wording for every successful checkout. */
(function(root){
  const clean=value=>String(value||'').replace(/[\r\n]+/g,' ').trim();
  function delivery(details){
    if(details.checkoutVersion===2){
      const snapshot=details.deliverySnapshot,hours={standard_48h:48,express_24h:24,express_12h:12};
      if(!snapshot||typeof snapshot.speed!=='string'||!Object.hasOwn(hours,snapshot.speed)||snapshot.firstDraftHours!==hours[snapshot.speed]||!['INR','USD'].includes(snapshot.currency)||snapshot.currency!==(details.currency||'INR')||snapshot.startsAfter!=='payment_and_complete_details')return 'Delivery promise unavailable — please confirm with our team';
      return `First draft within ${snapshot.firstDraftHours} hours after payment and all required details (elapsed hours, including overnight)`;
    }
    return details.express?'First draft within 24 hours after payment and all required details':'First draft within 48 hours after payment and all required details';
  }
  function summary(details){
    const addons=Array.isArray(details.addons)?details.addons.map(clean).filter(Boolean):[];
    return {
      addons:addons.join(', ')||'None selected',
      delivery:delivery(details)
    };
  }
  function message(details){
    const order=summary(details);
    const lines=['Hello InviteStory, I have completed payment for my wedding invitation.','',
      `Package: ${clean(details.packageName)}`,
      `Design: ${clean(details.designName)||'To be confirmed with your team'}`,
      `Selected extras / included services: ${order.addons}`,
      `Delivery: ${order.delivery}`,
      `Amount paid: ${clean(details.amountText)} (${clean(details.currency)||'INR'})`,
      `Payment reference: ${clean(details.paymentId)}`];
    if(details.previewNames)lines.push(`Names used in preview (please confirm): ${clean(details.previewNames)}`);
    const source=[details.utm_source,details.utm_campaign,details.utm_term,details.utm_content].map(clean).filter(Boolean);
    if(source.length)lines.push(`Enquiry source: ${source.join(' / ')}`);
    lines.push('', 'Please confirm my order and share the checklist for names, event dates, venue details, photos and any other information you need.');
    return lines.join('\n');
  }
  root.InvitePaidOrder={summary,message};
})(globalThis);
