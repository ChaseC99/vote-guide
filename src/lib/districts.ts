const labels: Record<string, string> = {
  congressional: 'Congressional',
  congress: 'Congressional',
  assembly: 'Assembly',
  stateAssembly: 'Assembly',
  senate: 'State Senate',
  stateSenate: 'State Senate',
  boardOfEqualization: 'Board of Equalization',
  supervisorial: 'Supervisor',
  supervisor: 'Supervisor',
  bart: 'BART',
  courtOfAppeal: 'Court of Appeal',
  kernCommunityCollege: 'Kern Community College Trustee Area',
};
export function districtSummary(districts: Record<string, number>) {
  return Object.entries(districts)
    .map(([key, value]) => `${labels[key] ?? key} ${value}`)
    .join(' · ');
}
