var elementPrototypes = function(){
    function track_setting_proto(id, track, scale, x, y){
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
            <button class="close-setting btn btn-close col-1" data-id="properties-${id}"></button>
        </div>
        <label for="scale-${id}" class="d-none">Scale</label>
        <div class="input-group mb-2 mr-sm-2">
            <div class="input-group-prepend">
                <div class="input-group-text">Scale</div>
            </div>
            <input type="text" class="form-control" id="scale-${id}" onkeypress="return (event.charCode>=45 && event.charCode<=57)" value="${scale}">
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
        <img class="mtg-card img-fluid h-100" src="assets/files.png" alt="SET" data-print-search-uri="${url}">
    </div>
    `}

    function card_list_image_element(name, url, img) {
        return `
	<img class="set-card-img col" src="${img}" alt="SET" data-card-uri="${url}" data-card-name="${name}">
    `}


    return {
        get_property_group: track_setting_proto,
        card_list_text_element: card_list_text_element,
        card_list_image_element: card_list_image_element
    }
}();