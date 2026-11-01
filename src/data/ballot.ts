import data from './ballot.json';
import { ballotSchema } from './schema';

// Invalid content fails the build with a field-level validation error.
export const ballot = ballotSchema.parse(data);
export const sections = ['Federal', 'State', 'Local'] as const;
