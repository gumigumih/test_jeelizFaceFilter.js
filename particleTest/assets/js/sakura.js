class SpawnObject {
  constructor(original, viewport) {
    this.shape = original.cloneNode();
    this.viewport = viewport;
    this.range = Utils.getViewportRange(viewport);
    this.viewport.appendChild(this.shape);
    this.shape.setAttribute('shadow', 'receive: false')
    this.setup();
  }
  setup(options = {
    excludeRange: '0 0 0',
    expandRange: '1 1 1'
  }) {
    const {
      expandRange,
      excludeRange
    } = options;
    this.enabled = true;
    this.position = Utils.getVectorValueWithRange(this.range, expandRange, excludeRange);
    this.rotation = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    this.acceleration = new THREE.Vector3(0, 0, 0);
  }
  update() {
    if (!this.enabled) {
      return;
    }
    const velocity = this.acceleration;
    const position = this.position.add(velocity);
    this.render();
  }
  render() {
    this.shape.setAttribute('position', this.position)
    this.shape.setAttribute('rotation', this.rotation);
    this.shape.setAttribute('scale', this.scale)
  }
  destroy() {
    this.enabled = false;
  }
}

class Snow extends SpawnObject {
  setup() {
    super.setup();
    const {
      getRandom: r,
      getCentralizedValue: c
    } = Utils;
    const scale = r(0.5, 2);
    this.position.y = r(this.range.y, this.range.y + 4);
    this.scale = new THREE.Vector3(scale, scale, scale);
    this.acceleration = new THREE.Vector3(
      c(r(0.01), 0.01), -r(0.01, 0.02), c(r(0.01), 0.01));
  }
  update() {
    super.update();
    if (!this.enabled) {
      return;
    }
    if (this.position.y <= 0) {
      this.destroy(Math.random() * 1000)
    }
  }
  destroy(delay) {
    super.destroy();
    setTimeout(() => this.setup(), delay);
  }
}
const Utils = {
  getRandom: (min = 1, max) => {
    if(max == null) {
      return Math.random() * min;
    } else {
      return Math.random() * (Math.abs(min) + Math.abs(max)) + min;
    }
  },
  getCentralizedValue: (value = 0, length = 1, exclude = 0) => {
    value = value - length / 2;
    if(Math.abs(value) < exclude){
      value += exclude * (value < 0 ? -1 : 1);
    }
    return value;
  },
  getViewportRange(viewport){
    let range = '80 12 80';
    if(viewport != null){
      range = viewport.getAttribute('data-range') || range;
    }
    return new THREE.Vector3(...range.split(' '));
  },
  getVectorValueWithRange(range, expand, exclude){
    const { getRandom: r, getCentralizedValue: c } = Utils;
    expand = new THREE.Vector3(...expand.split(' '));
    exclude = new THREE.Vector3(...exclude.split(' '));
    const getValue = () => {
      const x = c(r(range.x * expand.x), range.x * (expand.x < 1 ? 1 : expand.x));
      const z = c(r(range.z * expand.z), range.z * (expand.z < 1 ? 1 : expand.z));
      const y = 0;
      return [ x, y, z ];
    }
    let value;
    let count = 0;
    while(true){
      value = new THREE.Vector3(...getValue());
      if((Math.abs(value.x) > exclude.x || Math.abs(value.z) > exclude.z) || count > 10){
        break;
      }
    }
    return value;
  }
};

function animation() {
  const snow = document.getElementById("sakura");
  const viewport = document.getElementById("jeelizFaceFilterFollow");
  const snowGroup = Array(40).fill(null).map(() => new Snow(snow, viewport));
  const update = () => {
      snowGroup.forEach(snow => snow.update());
      window.requestAnimationFrame(update);
  }
  update();
}