import signale from 'signale';

import { defineEvent } from '../lib/Event';

export default defineEvent({
  name: 'error',
  execute(_client, err: Error) {
    signale.error(err);
  },
});
