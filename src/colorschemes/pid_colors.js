const pid = {};

// calculating the conservation is expensive 
// we only want to do it once
pid.init = function(){}

pid.run = function(letter,pos, conservation){
  if (!conservation || conservation.progress!==1 || pos>conservation.map.length)
    return "#ffffff";
  
  var cons = conservation.map[pos][letter]||0;
  if(cons > 0.8){
    return "#6464ff";
  }else if(cons > 0.6){
    return "#9da5ff";
  }else if(cons > 0.4){
    return "#cccccc";
  }else{
    return "#ffffff";
  }
}

export default pid;
