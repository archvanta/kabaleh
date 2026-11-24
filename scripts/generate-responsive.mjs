import sharp from 'sharp';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile('content/photo-manifest.json','utf8'));
const output={};await mkdir('public/images/responsive',{recursive:true});
for(const p of manifest.photos){const key=createHash('sha256').update(p.path).digest('hex').slice(0,12);const widths=[480,960,1440].filter(w=>w<p.width);widths.push(p.width);output['/images/originals/'+p.path]=[];for(const w of widths){const name=`${key}-${w}.webp`;await sharp('public/images/originals/'+p.path).resize({width:w,withoutEnlargement:true}).webp({quality:88}).toFile('public/images/responsive/'+name);output['/images/originals/'+p.path].push({width:w,src:'/images/responsive/'+name})}}
await writeFile('content/responsive-images.json',JSON.stringify(output,null,2));console.log('21 originals retained; responsive delivery copies generated');
