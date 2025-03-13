const MAX_CHARS = 150;
const BASE_URL_API = 'https://bytegrad.com/course-assets/js/1/api';
/* COUNTER COMPONENT*/

const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackListEl = document.querySelector('.feedbacks');
const submitButtonEl = document.querySelector('.submit.btn');
const hashtagsistEl = document.querySelector('.hashtags');

const inputHandler = () =>{
    //determinate the maximun number of characters
    const maxNumberChar = MAX_CHARS;


    //determine number of characater currently typed
    const numberCharTyped = textareaEl.value.length;

    //calculate number of character left
    const charLeft = maxNumberChar - numberCharTyped;

    //show number left
    
    counterEl.textContent = charLeft;
}
const spinerEl = document.querySelector('.spinner')

const renderFeedbackItems = feedbackitem =>{
    const feedbackItemHtml = `
        <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackitem.upvoteCount}</span>
            </button>
        <section class="feedback__badge">
            <p class="feedback__letter">${feedbackitem.badgeLetter}</p>
        </section>
        <div class="feedback__content">
            <p class="feedback__company">${feedbackitem.company}</p>
            <p class="feedback__text">${feedbackitem.text}</p>
        </div>
        <p class="feedback__date">${feedbackitem.daysAgo === 0 ? 'NEW' : `${feedbackitem.daysAgo}`}d</p>
    </li>`;

    //insert new item
    feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHtml);
};


textareaEl.addEventListener('input', inputHandler);

/*FORM COMPONENT*/

const showVisualIndicator = (textcheck) =>{
    //show validation
    formEl.classList.add('textcheck');

    //hide validation
    setTimeout(() => formEl.classList.remove('textcheck'), 2000);
}

const submitHandler = (event) =>{
    //prevent default browser action 
    event.preventDefault();

    //get text from form
    const text = textareaEl.value;

    //validations

    if(text.includes('#') && text.length > 5){
        showVisualIndicator('form--valid');
    }else{
        showVisualIndicator('form--invalid');

        textareaEl.focus();

        return;
    }

    //we have text, now extract info
    const hashtag = text.split(' ').find(word => word.includes('#'));
    const companyName = hashtag.substring(1);
    const badgeLetter = companyName.substring(0, 1).toUpperCase();
    const upVoteCount = 0;
    const daysAgo = 0;

    //set object feedbackitem
    const feedbackItem = {
        hashtag: hashtag,
        company: companyName,
        badgeLetter: badgeLetter,
        upvoteCount: upVoteCount,
        daysAgo: daysAgo,
        text: text
    };
    
    //new Feedback item html
    renderFeedbackItems(feedbackItem);

    //send feedback object to server
    fetch(`${BASE_URL_API}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(feedbackItem),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        } 
    }).then(response =>{
        if(!response.ok){
            console.log('Something went wrong');
        }
        console.log('Successfully submited');
        return;
    }).catch(error => console.log('Error: ' + error.message))

    //clear textarea
    textareaEl.value = '';

    //blur submit button
    submitButtonEl.blur();

    //reset counter
    counterEl.textContent = MAX_CHARS;

}



formEl.addEventListener('submit', submitHandler);


const clickHandler =event =>{
    //get cllicked element html
    const clickedEl = event.target;

    //intentionality 
    const updatevoteIntention = clickedEl.className.includes('upvote');
    if(updatevoteIntention){
        //get the closest element to upvote button
        const upvoteBtnEl = clickedEl.closest('.upvote');

        //disable upvote button (prevent doubleclick, spam)
        upvoteBtnEl.disabled = true;

        //select the upvote count element within the upvote button
        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');

        //get currently display upvote count as number
        let upvoteCount = +upvoteCountEl.textContent;
        console.log(upvoteCountEl.textContent);
        //set upvote count
        upvoteCountEl.textContent = upvoteCount + 1;
        console.log(upvoteCountEl.textContent);

    }else{
        //expand the click
        clickedEl.closest('.feedback').classList.toggle('feedback--expand');

    }
}

feedbackListEl.addEventListener('click', clickHandler);

//FEEDBACK LIST COMPONENT

fetch(`${BASE_URL_API}/feedbacks`)
    .then(response => {
        return response.json();
    })
    .then(data => {
        
        //remove spiner 
        //spinerEl.remove();

        data.feedbacks.forEach(element => {
            renderFeedbackItems(element);
        });        
    })
    .catch(error => {
        feedbackListEl.textContent = `Failed to fetch feedback items. Error Message: ${error.message}`;
    }); 

//list component
const clickHandler2 = event =>{
    //get clicked event
    const clickedEl2 = event.target;

    //stop function if click happend in list, but ofside buttons
    if(clickedEl2.className === 'hashtags') return ;
    
    //extrac company name
    const companyNameFromClicked = clickedEl2.textContent.substring(1).toLowerCase().trim();

    //iterate from each element of list
    feedbackListEl.childNodes.forEach(childNode => {

        console.log(clickedEl2);
        console.log(childNode.textContent);

        //stop iteration if text node
        if(childNode.nodeTypes === 3) return;

        //extract company name of node
        const companyNameFromNode = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();

        //remove company names thats not equal
        if(companyNameFromClicked !== companyNameFromNode){
            childNode.remove();
        }
    });
}

hashtagsistEl.addEventListener('click', clickHandler2)