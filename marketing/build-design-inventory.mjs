import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../scripts.js', import.meta.url), 'utf8');
const database = source.match(/const TEMPLATE_DATABASE = (\[[\s\S]*?\n\]);/);
if (!database) throw new Error('Could not find the invitation catalogue');
const designs = vm.runInNewContext(database[1], {}, { timeout: 1000 });
const csv = value => `"${String(value).replaceAll('"', '""')}"`;
const rows = [['design_id', 'design_name', 'package', 'price_inr', 'price_usd', 'preview_url', 'image_url', 'rsvp_included', 'ad_headline', 'ad_text']];
for (const item of designs) {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const packageName = item.tier === 4 ? 'Dearly' : item.tier === 3 ? 'Luxury' : 'Premium';
  const rsvp = item.tier === 4 ? 'Email RSVP' : 'WhatsApp RSVP';
  rows.push([item.id, item.name, packageName, item.priceINR, item.priceUSD,
    `https://invitestory.in/?design=${slug}&utm_source=meta&utm_medium=paid_social&utm_campaign=design_remarketing&utm_content=${slug}`,
    new URL(item.image, 'https://invitestory.in/').href, rsvp,
    `${item.name}, made for your wedding`,
    `Still imagining your wedding in ${item.name}? Open the live invitation again. Personalized by our team for ₹${item.priceINR.toLocaleString('en-IN')}, with music, venue directions and ${rsvp}. ${item.tier === 4 ? '24h express is included.' : 'First draft within 48h.'} Delivery starts after payment and complete details.`]);
}
await writeFile(new URL('./design-inventory.csv', import.meta.url), rows.map(row => row.map(csv).join(',')).join('\n') + '\n');
console.log(`Prepared ${designs.length} designs with matching prices, creative references and destination links.`);
