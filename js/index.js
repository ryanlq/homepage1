//全局变量
let mune_selected = ''

//固定节点
//---tips---
const tips = document.querySelector('#tips'); 
let tips_event_handler = null; //事件句柄

const shadowHost = document.querySelector('#host');
const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

//常量
const eudic_url = "https://dict.eudic.net/mdicts/en/"
const youdao_url = "https://m.youdao.com/dict?le=eng&q="
const translate_url = "https://www.bing.com/dict/search?q="

function createlink(rel,href){
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    return link;
}

function note_br(note){
    if(!note) return false;
    else return note.replace(/\n/g,'<br/>')
}

function create_menubtn(menu){

    var menubtn = document.createElement('div');
    menubtn.id = "menu-button"
    menubtn.innerText = 'W';
    menubtn.addEventListener("click",function(e){
        menu.classList.contains('open')?menu.classList.remove('open'):menu.classList.add('open')
    })
    return menubtn;
}



shadowRoot.appendChild(createlink('stylesheet','./styles/pure-min.css'))
shadowRoot.appendChild(createlink('stylesheet','./styles/grids-responsive-min.css'))
shadowRoot.appendChild(createlink('stylesheet','./styles/menus.css'))

var style = document.createElement('style');
style.textContent = STYLES
shadowRoot.appendChild(style)




// var DATAS = {}
// NOTES.forEach(note=>{
//     if(!DATAS[note['section']]){
//         DATAS[note['section']] = [note]
//     } else {
//         DATAS[note['section']].push(note)
//     }
// })

// const chapters = Object.keys(DATAS) 
// console.log(DATAS)

async function create_menu_lists(selected_callback,callback){
    
    const pure_menu_list = document.createElement('ul');
    pure_menu_list.classList.add('pure-menu-list')

    //top area start
    const pure_menu_item_top = document.createElement('li');
    pure_menu_item_top.classList.add('pure-menu-item', 'pure-menu-link','link')
    pure_menu_item_top.setAttribute('for',"top_area")
    pure_menu_item_top.innerText = "生词本"
    pure_menu_item_top.addEventListener("click", function( event ) {
        pure_menu_list.querySelector('.selected').classList.remove('selected')
        event.target.classList.add('selected')        
        selected_callback('top_area')
        window.scrollTo(0,0) 
        callback()
    }, false);
    pure_menu_list.appendChild(pure_menu_item_top)

    //top area end

    
    await db.deathmask_chapters.toArray(chapters=>{
        chapters.forEach((chapter,i)=>{
            const _chapter = 'CHAPTER_'+chapter['chapter']
            const pure_menu_item = document.createElement('li');
            
            pure_menu_item.classList.add('pure-menu-item', 'pure-menu-link','link')
            pure_menu_item.setAttribute('for',_chapter)
            
            pure_menu_item.innerText = _chapter
            if(i == 0){
                selected_callback(_chapter)
                pure_menu_item.classList.add('selected')
            }
            
            pure_menu_item.addEventListener("click", function( event ) {
                pure_menu_list.querySelector('.selected').classList.remove('selected')
                event.target.classList.add('selected')

                
                selected_callback(event.target.attributes['for'].value)
                window.scrollTo(0,0) 
                callback()
            }, false);
            pure_menu_list.appendChild(pure_menu_item)
        })
    })
    return pure_menu_list;
}
async function create_menus(selected_callback){
    const menu = document.createElement('div');
    menu.id="menu"
    const pure_menu = document.createElement('div');
    pure_menu.classList.add('pure-menu')    
    const menu_lists = await create_menu_lists(selected_callback,()=>{
        menu.classList.contains('open') && menu.classList.remove('open')
    })

    pure_menu.appendChild(menu_lists)

    menu.appendChild(pure_menu)
    return menu;

}

function card_buttons(wordDiv,word){
    const buttons = document.createElement('div');
    buttons.id = "word-btns"
    buttons.classList.add('pure-u-6-24')

    const buttons_row1 = document.createElement('div');
    buttons_row1.id = "word-btns-row1"
    const buttons_row2 = document.createElement('div');
    buttons_row2.id = "word-btns-row2"

    const markbtn = document.createElement('div');
    markbtn.id = "word-mark"
    markbtn.innerText = wordDiv.getAttribute('ismarked') == 'true'?"-":"+"
    markbtn.classList.add(wordDiv.getAttribute('ismarked') == 'true'?"remove":"add")

    markbtn.addEventListener('click',async function(e){
        const ismarked = wordDiv.getAttribute('ismarked')
        const id = wordDiv.id.replace('word_','')
        if(ismarked == 'true'){
            // 取消标记
            await db_change('deathmask',id,{'ismarked':'false'})
            markbtn.innerText = "+"
            markbtn.classList.remove('remove')
            markbtn.classList.add('add')
            wordDiv.setAttribute('ismarked','false')
        } else {
            //添加标记
            await db_change('deathmask',id,{'ismarked':'true'})
            markbtn.innerText = "-"
            markbtn.classList.remove('add')
            markbtn.classList.add('remove')
            wordDiv.setAttribute('ismarked','true')
        }
    })

    const turnoverbtn = document.createElement('div');
    turnoverbtn.id = "word-turnover"
    turnoverbtn.innerText = "反转"
    turnoverbtn.addEventListener('click',function(e){
        
        if(wordDiv.classList.contains('backside')){
            wordDiv.classList.remove('backside')
        }else {
            wordDiv.classList.add('backside')
        }
    })


    const querybtn = document.createElement('div');
    querybtn.id = "word-query"
    querybtn.innerText = "查询"
    querybtn.addEventListener('click',function(e){
        const words = word.split(' ')
        if(words && (words.length>1)){
            dict_frame.src = translate_url+words.join('+')
        } else {
            dict_frame.src =eudic_url + word.replace(/[\.,"]/g,'')
        }
        if(!frame.classList.contains('dict_show')){
            frame.classList.add('dict_show')
        }
    })


    const copybtn = document.createElement('div');
    copybtn.id = "word-copy"
    copybtn.innerText = "复制"
    copybtn.addEventListener('click',function(e){
        navigator.clipboard.writeText(word)
        tips.style['display'] = 'block'
        setTimeout(() => {
            tips.style['display'] = 'none';
            tips_event_handler= null
        },'1500')
    })
    //buttons.appendChild(turnoverbtn)
    
    buttons_row1.appendChild(turnoverbtn)
    buttons_row1.appendChild(markbtn)
    buttons_row2.appendChild(copybtn)
    buttons_row2.appendChild(querybtn)
    buttons.appendChild(buttons_row1)
    buttons.appendChild(buttons_row2)

    return buttons

}
async function create_main_contents(selected_menu_id,where='groupby',equals=false){
    const _chapter = selected_menu_id
    const chapterDiv = document.createElement('div');
    chapterDiv.id=_chapter
    chapterDiv.classList.add('pure-u-1','word-item')
    await db.deathmask.where(where).equals(!equals?selected_menu_id.replace('CHAPTER_',''):equals).toArray(async cards=>{
        cards.forEach(c=>{
            const {id,word,color,note,ismarked} = c
            const wordDiv = document.createElement('div');
            // TODO：id = bookneme + id
            wordDiv.id="word_"+id
            wordDiv.setAttribute('ismarked',(ismarked==''|ismarked=="false")?true:false)
            //
            wordDiv.classList.add("pure-g",'block',color)
            const html = `
            <div class="pure-u-14-24 word word-front" tabindex="0">${word}</div>
            <div class="pure-u-14-24 note word-back"  tabindex="0" >${note_br(note)||word}</div>
            ` 
            wordDiv.innerHTML = html
            wordDiv.addEventListener('mouseleave',function(e){
                    wordDiv.classList.remove('backside')
            })

            const buttons = card_buttons(wordDiv,word)
            wordDiv.appendChild(buttons)
            chapterDiv.appendChild(wordDiv)
            

        })
    })
    return chapterDiv
}

async function create_top_area(show_action){
    // const topArea = document.createElement('div');
    
    // topArea.id="top_area"
    // topArea.classList.add('pure-u-1','word-item')

    // vocabulary_notes = document.createElement('div');
    // vocabulary_notes.id="vocabulary_notes"
    let items = await create_main_contents("top_area",'ismarked','true') 

    // vocabulary_notes.innerText=html
    // // topArea.appendChild(items)
    // return topArea
    return items
}
async function create_layout(){
    const layout = document.createElement('div');
    layout.id="layout"
    
    const main = document.createElement('div');
    main.id="main"
    main.onscroll = "get_scroll_y()"


    //let main_content = await create_main_contents(id)
    let show_action = async (selectorid)=>{
        const selectElm = main.querySelector("#"+selectorid)
        const _show = main.querySelector('.show')
        _show&&_show.classList.replace('show','word-item')
        
        if(selectElm ){
            selectElm.classList.replace('word-item','show')
        } else {
            if(selectorid!=="top_area") {
                let new_main_content = await create_main_contents(selectorid)
                new_main_content.classList.replace('word-item','show')
                main.appendChild(new_main_content)
            } 
        }
    }

    let topArea = await create_top_area((selector)=>show_action(selector))
    main.appendChild(topArea)
    let menu = await create_menus((selector)=>show_action(selector))
    //main.appendChild(main_content)
    
    layout.appendChild(menu)
    layout.appendChild(main)
    shadowRoot.appendChild(create_menubtn(menu))
    shadowRoot.appendChild(layout)

}

db.deathmask.count().then(count=>{
    if(count==0){
        setTimeout(create_layout(), 5000 )
    }else{
        create_layout()
    }
}).catch(e=>console.error(e))



