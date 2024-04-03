/**
 * a helper function to make returning an element based on id easier and faster
 * @param {string} idName - the id of the element to be located
 * @returns {Element} with id idName
 */
export function id(idName) {
    return document.getElementById(idName);
}

/**
 * a helper function to make creating an element easier and faster
 * @param {string} tagName - the name of the element to create
 * @returns {Element} of type tagName
 */
export function gen(tagName) {
    return document.createElement(tagName);
}


export function toggleElementVisibility(elementID, displayType) {
    let element = id(elementID);
    if (element.style.display === "none") {
        element.style.display = displayType;
    } else {
        element.style.display = "none"
    }
}

export function toggleDropDownSectionVisibility(sectionContentID, sectionHeaderID, arrowButtonID, displayType) {
    let sectionContent = id(sectionContentID);
    let sectionHeader = id(sectionHeaderID);
    let arrowButton = id(arrowButtonID);

    if (sectionContent.style.display === "none") {
        sectionContent.style.display = displayType;
        sectionHeader.style.borderRadius = "15px 15px 0px 0px";
        arrowButton.classList.remove('down');
        arrowButton.classList.add('up');

    } else {
        sectionContent.style.display = "none";
        sectionHeader.style.borderRadius = "15px";

        arrowButton.classList.remove('up');
        arrowButton.classList.add('down');
    }
}