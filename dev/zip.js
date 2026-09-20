// @ts-check
const encoder = new TextEncoder();
const crcTable = Uint32Array.from({ length:256 }, (_, value) => { let crc = value; for (let bit=0;bit<8;bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; return crc >>> 0; });
/** Standard ZIP CRC32. @param {Uint8Array} data */
export function crc32(data) { let crc=0xffffffff; for(const byte of data) crc=crcTable[(crc^byte)&255]^(crc>>>8); return (crc^0xffffffff)>>>0; }
/** Dependency-free ZIP STORE archive, UTF-8 filenames, no server processing. @param {{name:string,data:Uint8Array}[]} files @returns {Blob} */
export function createZip(files) {
  const localParts=[], centralParts=[]; let offset=0, centralSize=0;
  for(const file of files){const name=encoder.encode(file.name), checksum=crc32(file.data);const header=new Uint8Array(30+name.length),view=new DataView(header.buffer);view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x800,true);view.setUint16(8,0,true);view.setUint16(12,0x5821,true);view.setUint32(14,checksum,true);view.setUint32(18,file.data.length,true);view.setUint32(22,file.data.length,true);view.setUint16(26,name.length,true);header.set(name,30);localParts.push(header,file.data);
    const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,0x5821,true);cv.setUint32(16,checksum,true);cv.setUint32(20,file.data.length,true);cv.setUint32(24,file.data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.set(name,46);centralParts.push(central);centralSize+=central.length;offset+=header.length+file.data.length;
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);return new Blob([...localParts,...centralParts,end],{type:'application/zip'});
}
