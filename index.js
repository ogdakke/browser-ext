
const inputEl = document.getElementById('input-el')
const inputBtn = document.getElementById('input-btn')
const ulEl = document.getElementById('ul-el')
const formEl = document.getElementById('box-wrapper')
const modeBtn = document.getElementById('mode-btn')
const modeElement = document.getElementById('body')

let myLeads;
let currentTab;

// yritä hakea linkit localstoragesta, jos ei ole, tee tyhjä array myLeads
let savedLeads = JSON.parse(localStorage.getItem('myLeads'))
    if (Array.isArray(savedLeads)) {
        myLeads = savedLeads;
    } else {
        myLeads = []
    }


const updateActiveTab = (tabs) => {

    let updateTab = (tabs) => {
        if (tabs[0]) {
            currentTab = tabs[0]
            inputEl.value = currentTab.url

        } else {
              console.log(`Bookmark it! does not support the '${currentTab.url}' URL.`)
            }
          
    }
    let gettingActiveTab = browser.tabs.query({active: true, currentWindow: true})
    gettingActiveTab.then(updateTab);
}
updateActiveTab();

browser.tabs.onUpdated.addListener(updateActiveTab);
browser.tabs.onActivated.addListener(updateActiveTab);
browser.windows.onFocusChanged.addListener(updateActiveTab);



/* Katso, tuleeko formEl:ltä submit-pyyntö, jolloin suoritetaan kaikki alla olevat funktiot.
html hoitaa kaava validioinnin -- e.preventdefault estää sivun uudelleenlatautumisen.
render-funktio saa _argumentikseen_ myLeads-arrayn.
*/ 
formEl.addEventListener('submit',(e) => {
    e.preventDefault();
    pushFunc()
    saveLeads()
    render(myLeads);
})

// browser.browserAction.onClicked.addListener(onSubmit)


/** 
 * removeLead() ottaa parametrikseen poistettavan leadin id:n, 
 * jonka se saa onDelete() funktiolta. -> 
 * suodattaa myLeads - arrayn --> jos true: ei poista, jos false: poistaa 
*/
const removeLead = idToDelete => {
    myLeads = myLeads.filter((n) => {
        if (idToDelete === n.id) {
            return false;
        } else {
            return true;

        }
    });
    saveLeads();
}

const onDelete = leadDelete => {
    return () => {
        removeLead(leadDelete.id)
        render(myLeads);
    }
}



const pushFunc = () => {
    // työnnä arrayhin inputvalue
    const id = '' + new Date().getTime();
    myLeads.push({
        value: inputEl.value,
        id: id
    })
    // tallenna se localstorageen
    saveLeads();
    // nollaa inputField
    inputEl.value = ''
}

const saveLeads = () => {
    localStorage.setItem('myLeads', JSON.stringify(myLeads))
}

/** funktiolle render annetaan parametriksi lead, jotta funktio on mukautuvampi--
 * esim. jos tulee toinen array, kuin myLeads, niin samaa render-funktiota voidaan hyödyntää
 * antamalla sille ARGUMENTIKSI eri array jossain muualla.
  */
const render = (lead) => {
    ulEl.innerHTML = ''
    let listItems = ""
    // funktio, jossa 'n' on arrayn jokainen käsitelty elementti.
    lead.forEach((n) => {
        // tämä vaihtoehto ei ole kirjoitettu template stringillä
            // listItems +="<li><a target='_blank' href='"+ n + "'>" + n + "<a/></li>";

        // ^vaihtoehtoinen tapa on luoda li 'createElement():llä', asettaa textContent ja sen jälkeen appendaa parent-elementtiin.
            listItems = document.createElement('li')
            listItems.className = 'li-el'
            
            aTag = document.createElement('a')
            aTag.textContent = n.value
            aTag.className = 'li-el'
            aTag.setAttribute('target', '_blank')
            aTag.setAttribute('href', `${n.value}`)

            listItems.appendChild(aTag)

            
            const deleteButton = document.createElement('button')
            deleteButton.id = 'delete-btn'
            deleteButton.className = 'li-el'
            deleteButton.onclick = onDelete(n)
            deleteButton.innerHTML = `<svg id='delete-svg' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
            listItems.append(deleteButton)

            ulEl.prepend(listItems)
        // template-string vaihtoehto ---------------------------
        // listItems += `
        //     <li class='li-el'>
        //         <a class='li-el' target='_blank' href='${n.value}'>${n.value}</a>
        //         </li>
        //         `
                // <button class='li-el' id='delete-btn' onclick='${onPress(n)}'></button>
        });
        // ulEl.innerHTML = listItems---------------------------- ei toiminut
}
render(myLeads);

// tarkista onko käyttäjällä preferenssiä darkmodesta, jos on, niin vaihda 
// 
// let savedMode = localStorage.getItem('mode')

modeBtn.addEventListener('click', () => {
    userPreference()
    console.log(localStorage.getItem('mode'));
})
const userPreference = () => {
    modeElement.classList.toggle('light-mode')
    modeElement.classList.toggle('dark-mode')
    
    let mode = modeElement.classList
    localStorage.setItem('mode', mode)
}
let savedMode = localStorage.getItem('mode')
if (savedMode == 'null') {
    savedMode = 'dark-mode'
    modeElement.className = savedMode
} else if (savedMode) {
    modeElement.className = savedMode
}