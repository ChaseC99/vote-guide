import { catalogs } from '../../../data/catalog';
import type { CountyBallots } from '../../../lib/ballotMatching';

export function getStaticPaths() {
  return catalogs.map((data) => ({ params: { county: data.countyId }, props: { data } }));
}

export function GET({ props }: { props: { data: CountyBallots } }) {
  return new Response(JSON.stringify(props.data), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
