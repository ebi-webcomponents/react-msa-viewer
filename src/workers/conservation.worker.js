const aLetterOffset = "A".charCodeAt(0);
const lettersInAlphabet = 26;

export const calculateConservation = (
  sequences,
  sampleSize = null,
  isWorker = false
) => {
  console.time("worker process");

  const length =
    (sequences && sequences.length && sequences[0].sequence.length) || 0;
  const finalSampleSize = sampleSize
    ? Math.min(sampleSize, sequences.length)
    : sequences.length;

  const sequencesToLoopThrough = sampleSize
    ? sequences.slice(0, finalSampleSize)
    : sequences;
  const conservation = new Float32Array(length * lettersInAlphabet);
  for (let i = 0; i < sequencesToLoopThrough.length; i++) {
    const { sequence } = sequencesToLoopThrough[i];
    for (let j = 0; j < sequence.length; j++) {
      const aa = sequence[j];
      const loopOffset = j * lettersInAlphabet;
      const letterIndex = aa.charCodeAt(0) - aLetterOffset;
      if (letterIndex < 0 || letterIndex >= lettersInAlphabet) {
        // outside of bounds of "A" to "Z", ignore
        continue;
      }
      conservation[loopOffset + letterIndex]++;
    }
  }

  for (let i = 0; i < conservation.length; i++) {
    conservation[i] /= finalSampleSize;
  }
  if (isWorker) {
    self.postMessage({ progress: 1, conservation }, [conservation.buffer]);
  }

  console.timeEnd("worker process");

  return conservation;
};

const onmessage = function (e) {
  if (self.previous !== e.data) {
    calculateConservation(e.data.sequences, e.data.sampleSize, true);
  }
  self.previous = e.data;
};
self.addEventListener("message", onmessage);

export default calculateConservation;
