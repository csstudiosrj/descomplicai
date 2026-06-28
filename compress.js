const s=require('sharp'),fs=require('fs'),p=require('path');
fs.readdirSync('public/images/breath').forEach(f=>{
const fp=p.join('public/images/breath',f);
s(fp).resize(1200,1200,{fit:'inside'}).jpeg({quality:75}).toBuffer().then(b=>{
fs.writeFileSync(fp,b);console.log(f+':'+(b.length/1024|0)+'KB')})})
