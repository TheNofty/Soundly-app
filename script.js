function selectItem(element) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
}

const volContainer = document.getElementById('vol-container');
const volKnob = document.getElementById('vol-knob');
const volFill = document.getElementById('vol-fill');

let isDragging = false;

volContainer.addEventListener('mousedown', function(e) {
    isDragging = true;
    updateVolume(e);
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        updateVolume(e);
        e.preventDefault();
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

function updateVolume(e) {
    const rect = volContainer.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    
    const percent = (offsetX / rect.width) * 100;
    volFill.style.width = percent + '%';
    volKnob.style.left = percent + '%';
}