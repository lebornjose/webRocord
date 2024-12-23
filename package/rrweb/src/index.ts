import rrweb from 'rrweb';

class Rrweb {
  rrweb: typeof rrweb;
  constructor(parameters) {
    this.rrweb = rrweb; 
    this.init();
  }
  init() {
    console.log('start');
  }
}

export default Rrweb;
