import React from 'react';
import { storiesOf } from '@storybook/react';
import { MSAViewer } from '../lib';
import { times } from 'lodash-es';
import { number } from '@storybook/addon-knobs';


const alphabet = 'ACDEFGHIKLMNPQRSTVWY';
const getRandomBase = () => alphabet[Math.floor(Math.random()*alphabet.length)];
const generateSequence = (length) => {
  let seq ='';
  for (let i=0; i<length; i++) seq+=getRandomBase();
  return seq;
}
const seqLengths = [100,1000,10000];
const nSeqs = [100,1000,10000];

for (let seqLength of seqLengths){
  for (let nSeq of nSeqs){
    storiesOf('Performance Test', module)
      .add(`${nSeq} sequencias of ${seqLength} residues`, function(){
        const options = {
          sequences: [],
          height: number("height", 500),
          width: number("width", 500),
          tileHeight: number("tileHeight", 20),
          tileWidth: number("tileWidth", 20),
          colorScheme: "clustal",
        };
        const sequence = generateSequence(seqLength);
        times(nSeq, () => {
          const mutation_pos = Math.round(Math.random()*sequence.length);
          options.sequences.push({
              name: `seq_${options.sequences.length}`,
              sequence: sequence.substring(0,mutation_pos) + '-' + sequence.substring(mutation_pos+1)
          });
        });
        return (
          <MSAViewer {...options} />
        )
      });
    }
  }