import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../scripts.js',import.meta.url),'utf8');
const match=source.match(/const TEMPLATE_DATABASE = (\[[\s\S]*?\n\]);/);
if(!match)throw new Error('Catalogue not found');
const designs=vm.runInNewContext(match[1],{}, {timeout:1000}).map(d=>({id:d.id,name:d.name,slug:d.slug||d.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''),tier:d.tier,inr:d.priceINR,usd:d.priceUSD}));
if(!process.argv[2])throw new Error('Pass the destination staff-portal src/website_catalogue.ts path');
await writeFile(process.argv[2],'// Snapshot of the website catalogue; regenerate when prices/designs change.\nexport const websiteDesigns = '+JSON.stringify(designs,null,2)+' as const;\n');
console.log(`Generated ${designs.length} server-priced designs.`);
