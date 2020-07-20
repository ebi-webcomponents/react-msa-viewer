import { StaticSchemeClass, DynSchemeClass } from "./schemeclass";

import AaAliphatic from "./aa_aliphatic";
import AaAromatic from "./aa_aromatic";
import AaCharged from "./aa_charged";
import AaNegative from "./aa_negative";
import AaPolar from "./aa_polar";
import AaPositive from "./aa_positive";
import AaSerineThreosine from "./aa_serine_threonine";
import Buried from "./buried";
import Cinema from "./cinema";
import Clustal from "./clustal";
import Clustal2 from "./clustal2";
import Helix from "./helix";
import Hydro from "./hydrophobicity";
import Lesk from "./lesk";
import Mae from "./mae";
import Nucleotide from "./nucleotide";
import Purine from "./purine";
import Strand from "./strand";
import Taylor from "./taylor";
import Turn from "./turn";
import Zappo from "./zappo";

import pid from "./pid_colors";

const staticSchemes = {
  aa_aliphatic: AaAliphatic,
  aa_aromatic: AaAromatic,
  aa_charged: AaCharged,
  aa_negative: AaNegative,
  aa_polar: AaPolar,
  aa_positive: AaPositive,
  aa_serine_threosine: AaSerineThreosine,
  buried: Buried,
  buried_index: Buried,
  cinema: Cinema,
  clustal2: Clustal2,
  clustal: Clustal,
  helix: Helix,
  helix_propensity: Helix,
  hydro: Hydro,
  lesk: Lesk,
  mae: Mae,
  nucleotide: Nucleotide,
  purine: Purine,
  purine_pyrimidine: Purine,
  strand: Strand,
  strand_propensity: Strand,
  taylor: Taylor,
  turn: Turn,
  turn_propensity: Turn,
  zappo: Zappo,
};

const dynSchemes = {
  conservation: pid,
};

const Colors = function (opt) {
  this.maps = clone(staticSchemes);
  this.dyn = clone(dynSchemes);
  this.opt = opt;
};

Colors.getScheme = function (scheme) {
  return staticSchemes[scheme];
};
Colors.prototype.getScheme = function (scheme) {
  var color = this.maps[scheme];
  if (color === undefined) {
    color = {};
    if (this.dyn[scheme] !== undefined) {
      return new DynSchemeClass(this.dyn[scheme], this.opt);
    }
  }
  return new StaticSchemeClass(color);
};

Colors.prototype.addStaticScheme = function (name, scheme) {
  this.maps[name] = scheme;
};

Colors.prototype.addDynScheme = function (name, scheme) {
  this.dyn[name] = scheme;
};

// small helper to clone an object
function clone(obj) {
  if (null == obj || "object" !== typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

export default Colors;
