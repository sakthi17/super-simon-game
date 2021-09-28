/* Essential to Keep track of all the timer-ids that is created. because, the instant gameOff signal is given
all timers has to be cleared immediately in the gameOFf() callback. so created an array and pushed all timerids
*/
/* TODO:
make "timersReference" an object.
timersReference= 
{
"playSeriesTID" : null,
"waitForUsrInputTID" : null,
"highlightNoteTID" = null;
}
*/

var timersReference = [];

var MAX_LEVEL = 20;
var AIInput = [];
var strictMode = false;
var level = 0;
var audioClips = [];
var colors = ["green","red","yellow","blue"];

$(document).ready(function(){
     
   mapAudioClipsToButtons();
          
   $("#gameon").click(function(){
          $(this).attr("disabled",true);
          $("#gameoff").attr("disabled",false);
          $("#strictmode").attr("disabled",false);
          gameOn();     
     });
     
   $("#gameoff").click(function(){
          $(this).attr("disabled",true);
          $("#gameon").attr("disabled",false);
          $("#strictmode").attr("disabled",true);
          $(".red-dot").css("background-color","grey");
          gameOff();
     });
     
   $("#strictmode").click(function(){
        if(strictMode){
             strictMode = false;
             $(".red-dot").css("background-color","grey");
        }     
        else{
             strictMode = true;
             $(".red-dot").css("background-color","red");
        }
   });  
     
 /* Auto game start for screenshot
     $("#gameon").click();
     $("#strictmode").click();
 /*****/    
}); 

function gameOff(){
     showStatus("Game OFF");
     AIInput = [];
     level = MAX_LEVEL + 1;
     $("#level > span").text(" -- ");
     $("div.buttons").removeClass("green-lit yellow-lit red-lit blue-lit");
     $("div.buttons").off();
     checkAndClearActiveTimers();
}

function gameOn(){
     // TODO : initializeGame();    
     AIInput =[];
     $("#level > span").text(" -- ");
     showStatus("Starting NEW GAME ... ");
     level = 1;
     generateAndPlayAILevel();

}

function generateAndPlayAILevel(){  
     if(level > MAX_LEVEL)
          return;
     //hideMessage(); 
     $("#level > span").text(level);
     /* using checkAndClearActiveTimers() here takes too much time to execute 
        and since its called for each successfull level , it hinders the play
     */
     timersReference = [];
     
     var note = chooseRandomNote();     
     AIInput.push(note);
     $("#series").text(AIInput);
     playSeriesAfterDelay(3000);     
}

function playSeriesAfterDelay(delayInMilliSecs){
     var timerId = setTimeout(function(){
                         showStatus("Memorize Sequence");
                         playSeries(AIInput);
                         clearTimeout(timerId);
                         timerId = null;
                    },delayInMilliSecs);
     timersReference.push(timerId);
}

function playSeries(AIInput){
     var index =0;
     var id = setInterval(function(){
               if(index === AIInput.length)
               {
                    clearInterval(id);
                    id = null;
                    waitForUsrInputAndValidate();
               }
               else{
                    highlightNoteForSpecifiedTime(AIInput[index],500);
                    index++;
               }     
          },1000);
     timersReference.push(id);
 }


function highlightNoteForSpecifiedTime(id,highlightTime)
{  
     $("div#"+id).addClass(colors[id] + "-lit");
     audioClips[id].play();
     var playNoteTimer = setTimeout(function(){
                          $("div#"+id).removeClass(colors[id] + "-lit");
                          clearTimeout(playNoteTimer);
                          playNoteTimer = null;
                         },highlightTime);
     timersReference.push(playNoteTimer);
}

function waitForUsrInputAndValidate(){
     showStatus("Your Turn .. Play Sequence ");
     var usrClickCount = 0;
     var seriesLength = AIInput.length;
     
     $("div.buttons").click(function(){
          disableClicksFor(600);   // >= highlight time
          usrClickCount++ ;
          var usrClickedNote = parseInt($(this).attr("id"),10);
          highlightNoteForSpecifiedTime(usrClickedNote,500);
                  
          if(isCurrentUserInputCorrect(usrClickedNote,usrClickCount))
          {
               if(isSeriesOver(usrClickCount,seriesLength))
               {
                    if(isMaxLevelReached()){
                         showStatus("Game End You win");
                         //showResult("!! You Win !!");
                    }    
                    else
                         showStatus("Going Next Level..");
                    
                    $("div.buttons").off();
                    // hideMessage();  
                    level++;
                    generateAndPlayAILevel();
               }     
          }
          else{
               $("div.buttons").off();
               showResult("Uh Oh! Error .. Try Again");
               //hideMessage();  
               wrongUserInputProcessing();
          }          
     });
}     

function wrongUserInputProcessing(){
     if(strictMode){
          gameOn();
     }
     else{
          playSeriesAfterDelay(3000);
     }
}

     
/*****  UTILITIES ****/

function disableClicksFor(timeInMiliSecs){
     $("div.buttons").css("pointer-events","none");
     var id = setTimeout(function enableClicks(){
         $("div.buttons").css("pointer-events","auto");               
     },timeInMiliSecs);
}    
     
 function isMaxLevelReached(){
     return level === MAX_LEVEL;     
}     
     
function isCurrentUserInputCorrect(userInput,clickCount){
     var originalNote = AIInput[clickCount-1];
     return userInput === originalNote;
}

function isSeriesOver(count,seriesLength){
     return count === seriesLength;
}

function showStatus(str){     
     $("#show-msg").text(str).show();
}

function showResult(str){
     $("#result-box").text(str).show().fadeOut(2000);
}

function checkAndClearActiveTimers(){
     timersReference.forEach(function(timerid){
          if(timerid !== null)
          {     
               clearTimeout(timerid);
               timerid = null;
          }     
     });
     timersReference= [];
}

function getRandomIntInclusive(min,max){
     return Math.floor(Math.random()*(max-min + 1))+ min;
}

function chooseRandomNote(){
     return getRandomIntInclusive(0,3);
}

function mapAudioClipsToButtons(){
    audioClips[0] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
    audioClips[1] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
    audioClips[2] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
    audioClips[3] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');
}