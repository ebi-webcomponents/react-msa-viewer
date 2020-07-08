self.conservation = null;

const calculateConservation = (sequences) => {
  const length = (sequences && sequences.length && sequences[0].sequence.length) ||0;


  self.conservation = Array.from(Array(length).keys()).map(()=>({}));
  let n = 0;
  for (let seq of sequences) {
    for (let i=0; i<seq.sequence.length;i++){
      if (!(seq.sequence[i] in conservation[i])){
        self.conservation[i][seq.sequence[i]]=0;
      }
      self.conservation[i][seq.sequence[i]]++;
    }
    self.postMessage({progress: (n++)/sequences.length, conservation});
  }
  self.conservation.forEach(cons => {
    Object.keys(cons).forEach(ch=>{
      cons[ch] /= sequences.length;
    })
  });
  self.postMessage({progress: 1, conservation});
}
onmessage = function(e) {
  if (self.previous !== e.data){
    calculateConservation(e.data);
  }

  self.previous = e.data;
  // self.postMessage(conservation);
};
self.addEventListener("message", onmessage);
