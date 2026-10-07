/* Shared receipt and WhatsApp wording for every successful checkout. */
(function(root){
  const clean=value=>String(value||'').replace(/[\r\n]+/g,' ').trim();
  function summary(details){
    const addons=Array.isArray(details.addons)?details.addons.map(clean).filter(Boolean):[];
    return {
      addons:addons.join(', ')||'None selected',
      delivery:details.express?'First draft within 24 hours after payment and all required details':'First draft within 48 hours after payment and all required details'
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
