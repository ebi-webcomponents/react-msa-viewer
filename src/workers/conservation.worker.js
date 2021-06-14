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
  const conservation = Array.from({ length }, () => ({}));
  for (let seq of sequencesToLoopThrough) {
    for (let i = 0; i < seq.sequence.length; i++) {
      if (!(seq.sequence[i] in conservation[i])) {
        conservation[i][seq.sequence[i]] = 0;
      }
      conservation[i][seq.sequence[i]]++;
    }
  }

  conservation.forEach((cons) => {
    Object.keys(cons).forEach((ch) => {
      cons[ch] /= finalSampleSize;
    });
  });
  if (isWorker) {
    self.postMessage({ progress: 1, conservation });
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
