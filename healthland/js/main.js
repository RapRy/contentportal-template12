$(() => {
    class Utils{
        constructor(){
            this.contenDir = "https://s3-ap-southeast-1.amazonaws.com/qcnt-portal/portal"
            this.contenDir2 = "https://s3-ap-southeast-1.amazonaws.com/qcnt/"
        }

        removeLoader(){$('.loaderWrapper').remove()}

        showLoader(){
            $('body').append(`
                <div class="loaderWrapper">
                    <div class="loaderContainer">
                        <span>⏳</span>     
                    </div>
                </div>
            `)
        }

        fetchContentDetails(form, resolve){
            const formData = new FormData
            formData.append("contentId", form[0])
            formData.append("catName", form[1])

            $.ajax({
                type:'POST',
                url:'backend/query.php',
                data: formData,
                dataType:'json',
                contentType:false,
                processData:false,
                success:(data, textStatus, xhr) => {
                    if(xhr.status === 200){resolve(data)}
                },
                error:(err) => console.log(err)
            })
        }

        fetchContents(form, resolve){
            const formData = new FormData
            formData.append("catId", form[0])
            formData.append("subId", form[1])
            formData.append("catName", form[2])
            formData.append("subName", form[3])
            formData.append("originCatName", form[4])

            $.ajax({
                type:'POST',
                url:'backend/query.php',
                data:formData,
                dataType:'json',
                contentType:false,
                processData:false,
                success:(data, textStatus, xhr) => {
                    if(xhr.status === 200){

                        $.each(data, (i, val) => {
                            const { category, contentId, fileName, icon, subCategory, title, originCatName } = val

                            if(category === "Videos"){
                                $('.contentListWrapper').append(`
                                    <div class="contentWrapper">
                                        <input type="hidden" value="${originCatName}" />
                                        <input type="hidden" value="${contentId}" />
                                        <div class="contentThumbWrapper">
                                            <video preload="metadata">
                                                <source src="https://s3-ap-southeast-1.amazonaws.com/qcnt/${fileName}" type="video/mp4" />
                                            </video>
                                        </div>
                                        <div class="contentNameWrapper">
                                            <p>${title}</p>
                                            <span>${category} | ${subCategory}</span>
                                            <a href="https://s3-ap-southeast-1.amazonaws.com/qcnt/${fileName}">DOWNLOAD</a>
                                        </div>
                                    </div>
                                `)
                            }else{
                                const contentName = title.replaceAll(" ", "+")
                                const modFileName = fileName.replaceAll(" ", "+")

                                $('.contentListWrapper').append(`
                                    <div class="contentWrapper">
                                        <input type="hidden" value="${originCatName}" />
                                        <input type="hidden" value="${contentId}" />
                                        <div class="contentThumbWrapper">
                                            <img src="${this.contenDir}/${originCatName.toLowerCase()}/${subCategory.toLowerCase()}/${contentName.toLowerCase()}/${icon}" alt="${title}" />
                                        </div>
                                        <div class="contentNameWrapper">
                                            <p>${title}</p>
                                            <span>${category} | ${subCategory}</span>
                                            <a href="${this.contenDir}/${originCatName.toLowerCase()}/${subCategory.toLowerCase()}/${contentName.toLowerCase()}/${modFileName}">DOWNLOAD</a>
                                        </div>
                                    </div>
                                `)
                            }
                        })
                        
                        resolve(true)
                    }
                },
                error:(err) => console.log(err)
            })
        }

        fetchSubCats(form, resolve){
            const formData = new FormData
            formData.append("all", form)
            
            $.ajax({
                type:'POST',
                url:'backend/query.php',
                data:formData,
                dataType:'json',
                contentType:false,
                processData:false,
                success:(data, textStatus, xhr) => {
                    if(xhr.status === 200){
                        $.each(data, (iData, dataVal) => {
                            const { main, sub } = dataVal;
                            
                            $.each($('.mainCategory'), (iMainCategory, mainCat) => { 
                                if(main === $(mainCat).text()){
                                    $(mainCat).append(`<ul class="dropNavList"></ul>`)

                                    $.each(sub, (iSub, subVal) => {

                                        const {catId, subId, subCategory, originalCategoryName} = subVal

                                        $(mainCat).find('.dropNavList').append(`
                                            <li class="subCategory ${(iSub === 0 && iMainCategory === 0) ? "activeMenu" : ""}">
                                                <input type="hidden" value="${catId}" />
                                                <input type="hidden" value="${subId}" />
                                                <span data-origCat="${originalCategoryName}">${subCategory}</span>
                                            </li>
                                        `)
                                    })
                                }
                            })
                        })

                        resolve(data)
                    }
                },
                error:(err) => console.log(err)
            })
        }

        fetchTipsContents(subName, originCatName, catName, resolve){
            const subCat = subName.replace(subName.charAt(0), subName.charAt(0).toLowerCase())
            const subCatName = subName.substring(0, subName.length - 1)

            $.ajax({
                type:'GET',
                url:'tips/tips.json',
                dataType:'json',
                success: (data, textStatus, xhr) => {
                    if(xhr.status === 200){
                        $.each(data[subCatName], (i, val) => {
                            if(i === 20)
                                return false
                                
                            const { image, name } = val
    
                            $('.contentListWrapper').append(`
                                <div class="contentWrapper">
                                    <input type="hidden" value="${originCatName}" />
                                    <input type="hidden" value="${i}" />
                                    <div class="contentThumbWrapper">
                                        <img src="tips/${subCat.substring(0, subCat.length - 1)}/${image}.jpg" alt="${name}" />
                                    </div>
                                    <div class="contentNameWrapper">
                                        <p>${name}</p>
                                        <span>${catName} | ${subName}</span>
                                    </div>
                                </div>
                            `)
                        })
    
                        resolve(true)
                    }
                },
                error: (err) => console.log(err)
            })
        }

        fetchTipsContentDetails(contentId, subName, resolve){
            const subCatName = subName.substring(0, subName.length - 1)

            $.ajax({
                type:'GET',
                url:'tips/tips.json',
                dataType:'json',
                success: (data, textStatus, xhr) => {
                    if(xhr.status === 200){
                        resolve([data[subCatName][contentId]])
                    }
                },
                error: (err) => console.log(err)
            })
        }
    }

    class Content extends Utils{
        constructor(){
            super()
            this.contentThumb = $('.contentThumbWrapper')
            this.contentList = $('.contentListWrapper')
            this.siteContainer = $('.siteContainer')
        }

        showPreview(data, catName, subCatName, originCatName){

            if(catName === "Videos"){
                const { title, icon, description, filename, screenshots } = data

                this.siteContainer.append(`
                    <div class="contentPreview">
                        <div class="closePreviewBtn">
                            <span></span>
                            <span></span>
                        </div>
                        <div class="contentThumbDetails">
                            <div class="thumbWrap">
                                <video metadata>
                                    <source src="https://s3-ap-southeast-1.amazonaws.com/qcnt/${filename}" type="video/mp4" />
                                </video>
                            </div>
                            <div class="detailsWrap">
                                <p>${title}</p>
                                <span>${catName} | ${subCatName}</span>
                                <a href="https://s3-ap-southeast-1.amazonaws.com/qcnt/${filename}">DOWNLOAD</a>
                            </div>
                        </div>
                        <div class="previewWrapper">
                            <div class="videoPreview">
                                <span>Preview</span>
                                <video controls>
                                    <source src="https://s3-ap-southeast-1.amazonaws.com/qcnt/${filename}" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </div>
                `)
            }else if(catName === "Tips"){
                const subCat = subCatName.replace(subCatName.charAt(0), subCatName.charAt(0).toLowerCase())
                const {name, image, description} = data

                $('.siteContainer').append(`
                    <div class="contentPreview">
                        <div class="closePreviewBtn">
                            <span></span>
                            <span></span>
                        </div>
                        <div class="contentThumbDetails">
                            <div class="thumbWrap">
                                <img src="tips/${subCat.substring(0, subCat.length - 1)}/${image}.jpg" alt="${name}" />
                            </div>
                            <div class="detailsWrap">
                                <p>${name}</p>
                                <span>${catName} | ${subCatName}</span>
                            </div>
                        </div>
                        <div class="previewWrapper">
                            <div class="description">
                                <span>Description</span>
                                <p>${description}</p>
                            </div>
                        </div>
                    </div>
                `)
            }else{
                const { title, icon, description, filename, screenshots } = data
                const contentName = title.replaceAll(" ", "+")
                const modFileName = filename.replaceAll(" ", "+")

                let images = ""

                screenshots.forEach((screen, i) => images += `<img src="${this.contenDir}/${originCatName.toLowerCase()}/${subCatName.toLowerCase()}/${contentName.toLowerCase()}/screenshots/${screen}" alt="screenshot${i}" />`)

                this.siteContainer.append(`
                    <div class="contentPreview">
                        <div class="closePreviewBtn">
                            <span></span>
                            <span></span>
                        </div>
                        <div class="contentThumbDetails">
                            <div class="thumbWrap">
                                <img src="${this.contenDir}/${originCatName.toLowerCase()}/${subCatName.toLowerCase()}/${contentName.toLowerCase()}/${icon}" alt="${title}" />
                            </div>
                            <div class="detailsWrap">
                                <p>${title}</p>
                                <span>${catName} | ${subCatName}</span>
                                <a href="${this.contenDir}/${originCatName.toLowerCase()}/${subCatName.toLowerCase()}/${contentName.toLowerCase()}/${modFileName}">DOWNLOAD</a>
                            </div>
                        </div>
                        <div class="previewWrapper">
                            <div class="description">
                                <span>Description</span>
                                <p>${description}</p>
                            </div>
                            <div class="screenshotsWrapper">
                                <span>Screenshots</span>
                                <div class="screenshots">
                                    ${images}
                                </div>
                            </div>
                        </div>
                    </div>
                `)
            }

            $('.closePreviewBtn').on('click', (e) => {
                gsap.to($(e.currentTarget).parent(), {opacity:0, duration:.3, ease:"linear", onComplete:() => {
                    $(e.currentTarget).parent().remove()
                    this.contentList.css({display:"grid"})
                    gsap.fromTo(this.contentList, {opacity:0}, {opacity:1, duration:.3, ease:"linear"})
                }})
            })
        }

        clickEvt(){
            this.contentThumb.on('click', async (e) => {
                this.showLoader();

                const contentId = $(e.currentTarget).prev().val()
                const spanText = $(e.currentTarget).next().find('span').text()
                const catName = spanText.slice(0, spanText.indexOf(" "));
                const subCatName = spanText.slice((spanText.indexOf(" ") + 3), spanText.length)
                const originCatName = $(e.currentTarget).prev().prev().val()

                const form = [contentId, catName, subCatName];

                let promise = new Promise((resolve) => {
                    if(catName === "Tips"){
                        this.fetchTipsContentDetails(contentId, subCatName, resolve)
                    }else{
                        this.fetchContentDetails(form, resolve)
                    }
                })

                let res = await promise

                if(res.length != 0){
                    this.contentList.css({display:"none"})
                    this.showPreview(res[0], catName, subCatName, originCatName)
                    this.removeLoader();
                }
            })
        }
    }

    class Navigation extends Utils{
        constructor(){
            super()
            this.menuBurg = $('.menuBurgWrapper')
            this.navList = $('.navListWrapper')
            this.mainCategory = $('.mainCategory')
            this.subCategory = $('.subCategory')
            this.contentList = $('.contentListWrapper')
            this.isOpen = false
            this.mediaQuery740 = window.matchMedia("(min-width:740px)")
        }

        setDropListHeightTo0(){
            $.each(this.mainCategory, (i, elem) => {
                let dropNav = $(elem).find('.dropNavList')

                if(dropNav.height() > 0) this.hideDropList(dropNav)
            })
        }

        showDropList(elem){
            elem.find('.dropNavList').css({display:'block'})
            gsap.fromTo(elem.find('.dropNavList'), {height:0, opacity:0}, {height:"auto", opacity:1, duration:.2, ease:"linear"})
        }

        hideDropList(elem){
            gsap.to(elem, {height:0, opacity:0, duration:.2, ease:"linear", onComplete:() => {
                if(this.mediaQuery740.matches) elem.css({display:"none"})
            }})
        }

        hideNavigation(){
            gsap.to(this.menuBurg, {scale:0, opacity:0, duration:.3, ease:"linear", onComplete:() => {
                this.menuBurg.removeClass("openMenu")
                gsap.to(this.menuBurg, {scale:1, opacity:1, duration:.3, ease:"linear"})
            }})
            gsap.to(this.navList, {opacity:0, duration:.7, ease:"linear", onComplete:() => {
                this.navList.css({display:'none'})

                this.mainCategory.each(function(i){
                    if(!$(this).hasClass("activeMenu")){
                        $(this).find('.dropNavList').css({display:"none", height:0, opacity:0})
                        $(this).find('span').css({marginBottom:"0"})
                    }
                })
            }})
        }

        showNavigation(){
            this.navList.css({display:'flex'})

            gsap.fromTo(this.menuBurg, {scale:1, opacity:1}, {scale:0, opacity:0, duration:.3, ease:"linear", onComplete:() => {
                this.menuBurg.addClass("openMenu")
                gsap.to(this.menuBurg, {scale:1, opacity:1, duration:.3, ease:"linear"})
            }})

            gsap.fromTo(this.navList, {opacity:0}, {opacity:1, duration:.7, ease:"linear"})
        }

        mainCatClickEvt(){
            this.mainCategory.find('> span').on('click', (e) => {

                if(this.mediaQuery740.matches){
                    return false;
                }else{
                    const elem = $(e.currentTarget).parent()
                    if(elem.hasClass("activeMenu")){
                        return false;
                    }else{
                        elem.find('span').css({marginBottom:"25px"})
                        this.showDropList(elem)
                    }
                }
            })
        }

        mainCatMouseEnter(){
            this.mainCategory.find('> span').on('mouseenter', (e) => {
                const parent = $(e.currentTarget).parent()
                
                this.setDropListHeightTo0()

                this.showDropList(parent)
            })
        }

        navListMouseLeave(){
            this.navList.on('mouseleave', () => {
                this.setDropListHeightTo0()
            })
        }

        subCatClickEvt(){
            this.subCategory.on('click', async (e) => {
                if($(e.currentTarget).hasClass('activeMenu')){
                    return false;
                }else{
                    const catId = $(e.currentTarget).children().eq(0).val()
                    const subId = $(e.currentTarget).children().eq(1).val()
                    const originCatName = $(e.currentTarget).children().eq(2).attr('data-origcat')
                    const catName = $(e.currentTarget).parent().prev().text()
                    const subName = $(e.currentTarget).children().eq(2).text()

                    const form = [catId, subId, catName, subName, originCatName];

                    if(!this.mediaQuery740.matches){
                        this.hideNavigation();
                        this.isOpen = !this.isOpen
                    }
                    this.showLoader()
                    this.contentList.empty();

                    try{
                        let promise = new Promise((resolve) => {
                            if(catName === "Tips"){
                                this.fetchTipsContents(subName, originCatName, catName, resolve)
                            }else{
                                this.fetchContents(form, resolve)
                            }
                        })

                        let res = await promise

                        if(res){
                            this.removeLoader();

                            const content = new Content

                            content.clickEvt()
                            
                            this.mainCategory.each(function(i){
                                $(this).removeClass('activeMenu')
                            })

                            this.subCategory.each(function(i){
                                $(this).removeClass('activeMenu')
                            })

                            $(e.currentTarget).addClass('activeMenu').parent().parent().addClass('activeMenu')

                            if($('.contentPreview').length > 0){
                                $('.contentPreview').remove();
                                this.contentList.css({display:'grid', opacity:1})
                            }
                        }
                    }catch(err){
                        console.log(err)
                    }
                }
            })
        }

        menuBurgClickEvt(){
            this.menuBurg.on('click', () => {
                if(this.isOpen === false){
                    this.showNavigation()
                    this.isOpen = !this.isOpen
                }else if(this.isOpen === true){
                    this.hideNavigation()
                    this.isOpen = !this.isOpen
                }
            })
        }

        mediaQueryChangeEvt(){
            $(this.mediaQuery740).on('change', (e) => {
                if(e.currentTarget.matches){
                    if(this.isOpen === true){
                        this.isOpen = !this.isOpen
                        this.menuBurg.removeClass("openMenu")
                        this.mainCategory.find('span').css({marginBottom:"0"})
                    }else{
                        this.navList.css({display:"flex", opacity:1})
                    }

                    this.setDropListHeightTo0()

                    this.mainCatMouseEnter()
                    this.navListMouseLeave()

                }else{
                    this.setDropListHeightTo0()

                    this.mainCategory.find('> span').off('mouseenter').css({marginBottom:"25px"})
                    this.navList.off('mouseleave')
                    this.navList.css({display:"none", opacity:0})

                    this.showDropList($('.mainCategory.activeMenu'))

                }

                this.mainCatClickEvt()
                this.subCatClickEvt()
            })
        }

        loadEvents(){
            this.mediaQueryChangeEvt()

            if(this.mediaQuery740.matches){
                this.mainCatMouseEnter()
                this.navListMouseLeave()
            }

            this.mainCatClickEvt()
            this.subCatClickEvt()

            this.menuBurgClickEvt()
        }

    }

    class SiteLoad extends Utils{  
        constructor(){
            super()
        }
        
        async loadEvent(){
            this.showLoader()

            try{
                let promise = new Promise((resolve) => {

                    const fetchData = async () => {
                        try{
                            let subCatsPromise = new Promise((resolve) => {
                                this.fetchSubCats("all", resolve)
                            })
        
                            let resSubCats = await subCatsPromise
        
                            if(resSubCats.length != 0){
                                const { sub, main } = resSubCats[0]
                                const {catId, subId, modifiedCategoryName, subCategory, originalCategoryName} = sub[0]
                                const form = [catId, subId, modifiedCategoryName, subCategory, originalCategoryName]

                                this.fetchContents(form, resolve)
                            }
                        }catch(err){
                            console.log(err)
                        }
                    }

                    fetchData();
                })
    
                let res = await promise
    
                if(res){
                    this.removeLoader()
                    
                    // instance of Navigation class
                    // used to select all subcategories
                    const navigation = new Navigation

                    navigation.loadEvents();

                    // instance of Content class
                    const content = new Content

                    content.clickEvt()
                }
            }catch(err){
                console.log(err)
            }
        }
    }

    const siteLoad = new SiteLoad
  
    siteLoad.loadEvent()
})