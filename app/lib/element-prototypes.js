var elementPrototypes = function(){
    function track_setting_proto(id, track, scale, x, y, track_length){
        return`
    <div class="p-2 border-start border-1 border-dark border-opacity-10" id="properties-${id}" data-id="${id}">
        <label for="track-${id}" class="d-none">Track</label>
        <div class="row">
            <div class="input-group mb-2 mr-sm-2 col">
                <div class="input-group-prepend">
                    <div class="input-group-text">Track</div>
                </div>
                <input type="number" class="form-control" id="track-${id}" value="${track}">
            </div>
            <button class="close-setting btn col-1 border-0 text-secondary ps-0 pt-0" data-id="properties-${id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            </button>
        </div>
        <div class="row">
            <label for="scale-${id}" class="d-none">Scale</label>
            <div class="input-group mb-2 mr-sm-2 col">
                <div class="input-group-prepend">
                    <div class="input-group-text">Scale</div>
                </div>
                <input type="text" class="form-control" id="scale-${id}" onkeypress="return (event.charCode>=45 && event.charCode<=57)" value="${scale}">
            </div>
            
            <label for="length-${id}" class="d-none">Length</label>
            <div class="input-group mb-2 mr-sm-2 col">
                <div class="input-group-prepend">
                    <div class="input-group-text">Length</div>
                </div>
                <input type="text" class="form-control" id="length-${id}" onkeypress="return (event.charCode>=45 && event.charCode<=57)" value="${track_length}">
            </div>
        </div>

        <div class="row">
            <label for="pos-x-${id}" class="d-none">PosX</label>
            <div class="input-group mb-2 mr-sm-2 col">
                <div class="input-group-prepend">
                    <div class="input-group-text">Pos X</div>
                </div>
                <input type="text" class="form-control" id="pos-x-${id}" onkeypress="return (event.charCode>=45 && event.charCode<=57)" value="${x}">
            </div>
            <label for="pos-x-${id}" class="d-none">PosY</label>
            <div class="input-group mb-2 mr-sm-2 col">
                <div class="input-group-prepend">
                    <div class="input-group-text">Pos Y</div>
                </div>
                <input type="text" class="form-control" id="pos-y-${id}" onkeypress="return (event.charCode>=45 && event.charCode<=57)" value="${y}">
            </div>
        </div>
    </div>
    `
    }

    function card_list_text_element(name, url) {
        return `
    <div class='d-flex justify-content-between list-group-item list-group-item-action'>
        <a class='mtg-card text-decoration-none text-dark align-self-start w-100 d-block' href='#'>${name}</a>
        <img class="mtg-card" src="assets/files.png" alt="SET" data-print-search-uri="${url}">
    </div>
    `}

    function card_list_image_element(name, download_url, display_url, set) {
        return `
	<img class="set-card-img col" src="${display_url}" alt="SET" data-card-uri="${download_url}" data-card-name="${name}"
	data-set="${set}">
    `}


    return {
        get_property_group: track_setting_proto,
        card_list_text_element: card_list_text_element,
        card_list_image_element: card_list_image_element
    }
}();