
/**
 * Adds an onclick listener to a DOM element.
 * @param {String} id The ID of the DOM element.
 */
function addClickListener(id, func) {
  if (document.getElementById(id)) {
    document.getElementById(id).addEventListener('click', func);
  }
}

export {
  addClickListener
}
