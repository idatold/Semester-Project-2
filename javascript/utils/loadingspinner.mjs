export function createLoadingSpinner() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="bee-container">
          <div class="wing-container">
            <div class="wing" id="wing1"></div>
            <div class="wing" id="wing2"></div>
          </div>
          <div class="face-container">
            <div class="eye" id="left"></div>
            <div class="eye" id="right"></div>
            <div class="smile"></div>
          </div>
          <div class="bee">
            <div class="shadow"></div>
            <div class="stripe" id="one"></div>
            <div class="stripe" id="two"></div>
            <div class="stripe" id="three"></div>
            <div class="shine"></div>
          </div>
          <div class="leg-container">
            <div class="leg" id="leg1"></div>
            <div class="leg" id="leg2"></div>
          </div>
        </div>
      </div>
    `;
    return overlay;
  }
  
  export function showLoadingSpinner() {
    const container = document.getElementById('loading-spinner-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(createLoadingSpinner());
    }
  }
  
  export function hideLoadingSpinner() {
    const container = document.getElementById('loading-spinner-container');
    if (container) {
      container.innerHTML = '';
    }
  }
  