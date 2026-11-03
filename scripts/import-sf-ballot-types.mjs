// Offline import: download the official cross-reference first, review changes, then rebuild.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../src/data/elections/2026-11-03/', import.meta.url);
const input = process.argv[2] ?? fileURLToPath(new URL('san-francisco-xref.tsv', root));
const mapping = JSON.parse(readFileSync(new URL('san-francisco-contest-map.json', root), 'utf8'));
const [header, ...lines] = readFileSync(input, 'utf8')
  .replace(/^\uFEFF/, '')
  .trimEnd()
  .split(/\r?\n/);
const columns = header.split('\t');
for (const field of ['ELECTIONABBR', 'CONTESTID', 'BALLOTTYPE']) {
  if (!columns.includes(field)) throw new Error(`Missing column ${field}`);
}
const styles = new Map();
for (const line of lines.filter(Boolean)) {
  const row = Object.fromEntries(
    line.split('\t').map((value, index) => [columns[index], value.trim()]),
  );
  if (row.ELECTIONABBR !== '2026NOVGEN') throw new Error('Wrong election');
  const id = mapping[row.CONTESTID];
  if (!id) throw new Error(`Review and map new contest ${row.CONTESTID} before import`);
  if (!/^\d+$/.test(row.BALLOTTYPE)) throw new Error('Invalid ballot code');
  const style = styles.get(row.BALLOTTYPE) ?? {
    code: row.BALLOTTYPE,
    contestIds: [],
    districts: {},
  };
  if (style.contestIds.includes(id)) throw new Error(`Duplicate contest in ballot ${style.code}`);
  style.contestIds.push(id);
  const districtTypes = {
    'us-representative': 'congressional',
    'state-assembly': 'assembly',
    'state-senate': 'senate',
    'board-of-equalization': 'boardOfEqualization',
    'board-of-supervisors': 'supervisorial',
    'bart-director': 'bart',
  };
  for (const [prefix, field] of Object.entries(districtTypes)) {
    const match = id.match(new RegExp(`^${prefix}-district-(\\d+)$`));
    if (match) style.districts[field] = Number(match[1]);
  }
  styles.set(style.code, style);
}
if (!styles.size) throw new Error('No ballot types found');
const output = [...styles.values()].sort((a, b) => Number(a.code) - Number(b.code));
writeFileSync(new URL('san-francisco-styles.json', root), JSON.stringify(output, null, 2) + '\n');
console.log(
  `Imported ${output.length} ballot types. Review the diff, update verification dates, then run checks/tests/build.`,
);
