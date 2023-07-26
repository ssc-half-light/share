import type { Crypto } from '@oddjs/odd'

export function example (crypto:Crypto.Implementation) {
    return crypto.misc.randomNumbers({ amount: 7 })
}
