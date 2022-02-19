/* TO DO:

- files
  remove unused images, fonts. Change to minified js

- opening screen
  choose target language
  start game, save game, etc.

- onscreen meters:
    - health
    - points
    - qi level
    - skills/weapons? (equip water, fire, etc.?)
    - max stroke number
    - max character complexity

    
- instructions - totally rework

- animation & update function:
    wait for input time out .5s after keyup?
    display text time out
    sprite sheets

- fighting sessions:
    enemies
    character input
    only recognize a learned attack
    player health!
    don't kill the princess

- languages: 
    instruction language - choose language at beginning
    add Japanese pronunciations?
    different level definitions for different languages?

- sounds:
    pronunciation
    sound effects

- confirmation:
    with that stroke you can build
    after completing training session: You have mastered a new attack

- strokes, components, characters have minimum qi levels

- strokeData and dictionary in external files
     strokeData no longer in use?


*/


// GLOBAL ------------------------------------------------

var onHomeScreen = false;
var allowInput = true; // change to false after bug fixing

var game;
var timeCounter = 0;

var settings = {
    portrait_mode: false,
    top_margin_percent: 0.00,
    canvas_w_percent: 1, //0.95,
    canvas_w_correction: 1, //0.95,
    canvas_h_correction: 1, //0.95,
    canvas_h_w_ratio: 3/4,

    writerCount: 3,
    writerSize: 0.33,
    singleOverlayMultiplier: 2,

    canvas_bg_color: '#fff',
    home_screen_bg_color: '#fff', 
    touch_area_color: '#333',
    text_color: '#000',
    highlight_text_color: '#e31111', 

    targetLanguage: 'zh_CN',

    topText_y: 0.15,
    infoText_y: 0.25,
    instructions_y: 0.80,

    titleText1_y: 0.33,
    titleText2_y: 0.65,
    touchAreaHeight: 0.75,

    inputButton_height: 0.05,
    inputButton_width: 0.10,
    inputButton_y: 0.85,
    inputResult_size: 0.05,
    inputResult_y: 0.90,

    fullScreenControl_size: 0.05
};

var dimensions = {
    canvas_width: window.innerWidth * settings.canvas_w_percent, 
    canvas_height: window.innerWidth * settings.canvas_w_percent * settings.canvas_h_w_ratio,
    overlaySize: 0, // set by getOverlaySize function
    inputOverlaySize: 250, //  can't adust?
    inputButton_W: 50,
    inputButton_H: 20,
    inputResultSize: 50
}




const targetLangOptions = ['zh_CN', 'zh_TW', 'ja']; // not currently in use

const languages = [
    {
        id: 'zh_CN', 
        languageName: 'Simplified Chinese',
    },
    {
        id: 'zh_TW',
        languageName: 'Traditional Chinese',
    },
];

const dictionary = [
  //{id: "", en: "", charS: "", charT: "", pronM: ""},

  {id: "one", en: "one", charS: "一", charT: "一", pronM: "yī", structureS: "single", compositionS: "h", structureT: "single", compositionT: "h" },
  {id: "two", en: "two", charS: "二", charT: "二", pronM: "èr", structureS: "single", compositionS: "h.h", structureT: "single", compositionT: "h.h" },
  {id: "three", en: "three", charS: "三", charT: "三", pronM: "sān", structureS: "single", compositionS: "h.h.h", structureT: "single", compositionT: "h.h.h" },
  {id: "ten", en: "ten", charS: "十", charT: "十", pronM: "shí", structureS: "single", compositionS: "h.s", structureT: "single", compositionT: "h.s" },
  {id: "dry", en: "dry", charS: "干", charT: "干", pronM: "gān", structureS: "single", compositionS: "h.h.s", structureT: "single", compositionT: "h.h.s" },
  {id: "king", en: "king", charS: "王", charT: "王", pronM: "wáng", structureS: "single", compositionS: "h.h.s.h", structureT: "single", compositionT: "h.h.s.h" },

  {id: "pen", en: "pen/pencil/etc.", charS: "笔", charT: "筆", pronM:"bǐ"},
  {id: "paint", en: "paint/draw", charS: "画", charT: "劃", pronM:"huà"},
  {id: "overlord", en: "overlord", charS: "霸", charT: "霸", pronM:"bà"},
  {id: "han_chinese", en: "Chinese (Han)", charS: "汉", charT: "漢", pronM: "hàn"}, 
  {id: "character", en: "character(s)", charS: "字", charT: "字", pronM: "zì"}, 
  {id: "qi", en: "qi", charS: "气", charT: "氣", pronM: "qì"}, 
  {id: "horizontal_stroke", en: "horizontal stroke", charS: "横", charT: "横", pronM: "héng"}
  
]


const goodJobMessages = [
  'OK!',
  'Great!',
  'Good job!',
  'That\'s it!'
]

const strokeData = [
  { id: 'h', form: '一' , nameEnglish: 'horizontal stroke', namePinyin: 'héng', trainingText: 'Swipe horizontally, from left to right' }, 
  { id: 's', form: '丨' , nameEnglish: 'vertical stroke', namePinyin: 'shù', trainingText: 'Slice vertically, from top to bottom' }, 
];

var strokes = [];

var fonts = {}; // added by updateFontSizes function
var canvas;
var context;


const backgroundSources = [
  { id: 'full_screen_chop', url: 'images/full_screen_chop.png', rotateOnPortrait: false, align: 'top_left', ratio: settings.fullScreenControl_size, img: null},
  { id: 'pale_yellow', url: 'images/pale_yellow.png', rotateOnPortrait: true, align: 'center', ratio: 1.0, img: null},
  { id: 'ink_circle_thick', url: 'images/ink_circle_thick.png', rotateOnPortrait: false, align: 'center', ratio: 0.5, img: null},
  { id: 'ink_circle_sm', url: 'images/ink_circle_sm.png', rotateOnPortrait: false, align: 'center', ratio: 0.5, mg: null},
  { id: 'blue_purple_paper', url: 'images/blue_purple_paper.png', rotateOnPortrait: true, align: 'center', ratio: 1.00, img: null},
  { id: 'brown_paper', url: 'images/brown_paper.png', rotateOnPortrait: true, align: 'center', ratio: 1.0, mg: null},
  { id: 'pink_blob', url: 'images/pink_blob.png', rotateOnPortrait: true, align: 'center', ratio: 1.0, img: null},
  { id: 'multicolor_paint', url: 'images/multicolor_paint.png', rotateOnPortrait: true, align: 'center', ratio: 1.0, img: null},
  { id: 'bamboo_brown', url: 'images/bamboo_brown.png', rotateOnPortrait: false, align: 'bottom_right', ratio: 1.0, img: null},
  { id: 'bamboo_green', url: 'images/bamboo_green.png', rotateOnPortrait: false, align: 'top_left', ratio: 1.0, img: null},
  { id: 'bw_dragonflies', url: 'images/bw_dragonflies.png', rotateOnPortrait: false, align: 'top_right', ratio: 1.0, img: null},
  { id: 'plum_blossom_left', url: 'images/plum_blossom_left.png', rotateOnPortrait: false, align: 'center_left', ratio: 1.0, img: null}
]


function getOverlaySizes() {
    dimensions.overlaySize = Math.min(dimensions.canvas_height, dimensions.canvas_width * settings.writerSize);
}

function updateFontSizes() {
    fonts.titleLarge = Math.round(dimensions.canvas_width * 0.30) + "px STXingKai";
    fonts.titleSmall = Math.round(dimensions.canvas_width * 0.22) + "px ComforterBrush";
    fonts.clickToStart = Math.round(dimensions.canvas_width * 0.05) + "px Mali";
    fonts.topText = Math.round(dimensions.canvas_width * 0.05) + "px RockSalt";
    fonts.infoText = Math.round(dimensions.canvas_width * 0.03) + "px Mali";
    fonts.instructions = Math.round(dimensions.canvas_width * 0.03) + "px Mali";
}





function getChar(id) {
  let wordObj = dictionary.find(word => word.id === id);
  
    switch(settings.targetLanguage) {
        case 'zh_CN':
          return wordObj.charS;
          break;
  
        case 'zh_TW':
          return wordObj.charT;
          break;
  
        default:
          console.log('TARGET LANGUAGE NOT FOUND');
          break;
      
    }
}

function getPronunciation(id) {
  let wordObj = dictionary.find(word => word.id === id);
  
    switch(settings.targetLanguage) {
        case 'zh_CN':
          return wordObj.pronM;
          break;
  
        case 'zh_TW':
          return wordObj.pronM;
          break;
  
        default:
          console.log('TARGET LANGUAGE NOT FOUND');
          break;
      
    }
}

function getCharAndPronunciation(id) {
    let char = getChar(id);
    let pron = getPronunciation(id);
    return char + " (" + pron + ")";
}

function getEnglish(id) {
  let wordObj = dictionary.find(word => word.id === id);
  return wordObj.en;
}

function getStrokes(id) {
  let wordObj = dictionary.find(word => word.id === id);
  
    switch(settings.targetLanguage) {
        case 'zh_CN':
          if (wordObj.structureS == "single") {
            return wordObj.compositionS;
          } else {
            // composite structure - not yet built
            return wordObj.compositionS; // PLACEHOLDER ONLY. NOT CORRECT
          }
          break;
  
        case 'zh_TW':
          if (wordObj.structureT == "single") {
            return wordObj.compositionT;
          } else {
            // composite structure - not yet built
            return wordObj.compositionT; // PLACEHOLDER ONLY. NOT CORRECT
          }
          break;
  
        default:
          console.log('ERROR: TARGET LANGUAGE NOT FOUND');
          break;
      
    }
}


function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}


// LEVEL DATA (levelData) ------------------------------------------- 

const levelBackgrounds = [
  ['pink_blob', 'full_screen_chop', 'bamboo_brown'],
  ['blue_purple_paper', 'full_screen_chop'],  
  ['pale_yellow', 'full_screen_chop', 'bamboo_green'],
  ['plum_blossom_left', 'full_screen_chop'],
  ['pale_yellow', 'full_screen_chop'],
  ['pink_blob', 'full_screen_chop', 'bw_dragonflies'],
  ['multicolor_paint', 'full_screen_chop', 'bamboo_brown'],
  ['pale_yellow', 'full_screen_chop', 'plum_blossom_left'],
  ['brown_paper', 'full_screen_chop', 'bamboo_brown'],
  ['blue_purple_paper', 'full_screen_chop', 'bamboo_brown'],
  ['pale_yellow', 'full_screen_chop', 'bamboo_green']
];

const levelPlans = [                     // ***** //
    'train:stroke_h:2, train:char_one:2',
    'fight:goomba:3',
    'build:char_two',
    'train:char_two:2, train:char_three:2',
    'train:stroke_s:3, train:char_ten:3',
    'train:char_dry:3',
    'train:char_king:4'
];

// HANZI WRITER ------------------------------------------

var writer1 = HanziWriter.create('overlay-div-1', '一', {
  width: 150,
  height: 150,
  showCharacter: false,
  padding: 5
});


var writer2 = HanziWriter.create('overlay-div-2', '二', {
  width: 150,
  height: 150,
  showCharacter: false,
  padding: 5,

  outlineColor: '#eee',
  drawingColor: '#a503fc', // strokes drawn by user during quizzing
  drawingWidth: 25,  // stroke width drawn by user during quizzing, in px
  strokeColor: '#000',

  strokeAnimationSpeed: 2,
  strokeHighlightSpeed: 2,
  strokeFadeDuration: 400,
  delayBetweenStrokes: 100,
  delayBetweenLoops: 2000
});
//writer2.hideCharacter();

var writer3 = HanziWriter.create('overlay-div-3', '三', {
  width: dimensions.overlaySize,
  height: dimensions.overlaySize,
  padding: 5,
  strokeColor: '#000',
  //radicalColor: '#337ab7',
  showOutline: false,
  outlineColor: '#dcdcaa',
  drawingColor: '#a503fc', // strokes drawn by user during quizzing
  drawingWidth: 15,  // stroke width drawn by user during quizzing, in px
  showCharacter: true,
  showHintAfterMisses: 1,  // set to false to disable
  highlightOnComplete: true,
  highlightColor: '#aaf',

  strokeAnimationSpeed: 2,
  strokeHighlightSpeed: 2,
  strokeFadeDuration: 400,
  delayBetweenStrokes: 100,
  delayBetweenLoops: 2000
});
//writer3.hideCharacter();

var writers = [writer1, writer2, writer3];

/*
var writerT = HanziWriter.create('testing', '测', {
  width: 150,
  height: 150,
  showCharacter: false,
  padding: 5
});
writerT.quiz();
  */    

function overlayCharacter(char, writerNum) {
  let writer = writers[writerNum - 1];
  writer.setCharacter(char);
  //writer.showCharacter();

} 

function overlayCharacterAnimateOnce(char, writerNum) {
  overlayCharacter(char, writerNum);
  let writer = writers[writerNum - 1];
  writer.animateCharacter();
} 

function overlayCharacterLoop(char, writerNum) {
  overlayCharacter(char, writerNum);
  let writer = writers[writerNum - 1];
  writer.loopCharacterAnimation();
} 

/*
function overlayChainAnimations(arrayOfChars) { // doesn't work
  writer2.pauseAnimation();
  writer2.hideCharacter();
  writer2.hideOutline();

  writer3.pauseAnimation();
  writer3.hideCharacter();
  writer3.hideOutline();
  
  var delayBetweenAnimations = 1000; // milliseconds

  writer1.setCharacter(arrayOfChars[0]);
  writer1.animateCharacter({
    onComplete: function() {
      setTimeout(function() {
        writer2.setCharacter(arrayOfChars[1]);
        writer2.animateCharacter( {
          onComplete: function() {
            if (arrayOfChars.length > 2) {
              setTimeout(function() {
                writer3.setCharacter(arrayOfChars[2]);
                writer3.animateCharacter();
              })
            }
          }
        });
      }, delayBetweenAnimations);
    }
  }); 
}
*/

function overlayCharacterQuiz(char, writerNum) {
  overlayCharacter(char, writerNum);
  let writer = writers[writerNum - 1];
  writer.quiz({
    //showCharacter: true,
    //showOutline: true,
    //highlightOnComplete: true,
    onMistake: function(strokeData) {
      console.log('Oh no! you made a mistake on stroke ' + strokeData.strokeNum);
      //console.log("You've made " + strokeData.mistakesOnStroke + " mistakes on this stroke so far");
      //console.log("You've made " + strokeData.totalMistakes + " total mistakes on this quiz");
      console.log("There are " + strokeData.strokesRemaining + " strokes remaining in this character");
      writer.cancelQuiz();
      game.currentSession.resetProgress();
      //game.level.drawInstructions();
      game.incorrectMessage();
      game.currentSession.negativeFeedbackState = true;
    },
    onCorrectStroke: function(strokeData) {
      console.log('Yes!!! You got stroke ' + strokeData.strokeNum + ' correct!');
      //console.log('You made ' + strokeData.mistakesOnStroke + ' mistakes on this stroke');
      //console.log("You've made " + strokeData.totalMistakes + ' total mistakes on this quiz');
      console.log('There are ' + strokeData.strokesRemaining + ' strokes remaining in this character');
      game.inputStrokeIsCorrect(game.currentSession.targetStroke);
      //game.level.drawInstructions();
    },
    onComplete: function(summaryData) {
      console.log('You did it! You finished drawing ' + summaryData.character);
      //console.log('You made ' + summaryData.totalMistakes + ' total mistakes on this quiz');
      game.trainingRepComplete();
      //game.level.drawInstructions();
    }
  });
}



function turnOnInput() {
  allowInput = true;
  $(".hideable").removeClass("hidden");

}


function turnOffInput() {
  allowInput = false;
  $(".hideable").addClass("hidden");
}





// CLASSES ------------------------------

class Game {
    constructor() { 

        this.defineStrokes();
        //console.log("Target language set to: " +  settings.targetLanguage + "\n");
        this.jiaYou;
        this.getJiaYou();
        this.buDui = "No... "
      
        this.levelNumber = 0;    
        this.level;
        this.createLevel();

        this.needsResized = true;

        this.wantsNextStroke = true;
        this.wantsNextCharacter = false;

        this.currentSession;
        
    }


    defineStrokes() {
       for (let i = 0; i < strokeData.length; i++) {
         let s = strokeData[i];
         let newStroke = new Stroke(
           s.id,
           s.form,
           s.nameEnglish,
           s.namePinyin,
           s.trainingText
         );
         strokes.push(newStroke);
       }

      //console.log("Strokes:");
      //console.log(strokes);
       
    }

    getJiaYou() {
      this.jiaYou = getRandomFromArray(goodJobMessages);
    }

    reminderJiaYou() {
      this.jiaYou = `Hmm... a ${this.currentSession.getTargetStrokeName()}...`;
    }

    incorrectMessage() {
      this.jiaYou = `${this.buDui}`;
    }
  
    createLevel() {
        this.level = new Level(this, levelPlans[this.levelNumber]);
        this.level.buildSessions(this.level.plan);
        this.level.getSession();
        
    }
  
    drawText(text, x, y, alignment, fontString) {
        context.textAlign = alignment;
        context.textBaseline = "middle";
        context.font = fontString;
        context.fillStyle = settings.text_color;
        context.fillText(text, x, y);
    }
  
    animate() {
        game.level.drawOpeningText();
    }

    

    /*
    handleInput(inputCode) {
      console.log("Handling input: " + inputCode);
      let session = game.currentSession;
      
      if (session instanceof TrainingSession) {
        this.handleTrainingInput(inputCode);
        
      } else if (session instanceof FightingSession) {
        // fighting session - not yet built
        this.handleFightingInput(inputCode);
        
      } else {
        // neither training nor fighting?
        console.log("NO SESSION FOUND");
      }
    }
    

    handleTrainingInput(inputCode) {
        let session = game.currentSession;
        let targets = session.getTargetStrokesArray();
        let targetStroke = session.getTargetStroke();
        
        if (targets.length == 1) {
          // if target is a single stroke  
        
          if (inputCode == targetStroke) {
              // if input stroke matches target stroke
              this.trainingRepComplete();
            
          } else {
              this.reminderJiaYou();
              // if incorrect key
              // do nothing, wait for next try
          }
        } else {
            // target is more than one stroke  
  
            if (inputCode == session.targetStroke) {
              // if input stroke matches current stroke of target

              this.inputStrokeIsCorrect(inputCode);
  
            } else {
                // if input stroke does not match current stroke of target
                // reset current progress and back to beginning of target
                session.resetProgress();
                this.incorrectMessage();
                session.negativeFeedbackState = true;
              
                // but then count it as the first stroke if it is the first stroke of target
                if (inputCode == session.targetStroke) {
                  //console.log("Stroke was unexpected but matches the first one");
                  
                  this.inputStrokeIsCorrect(inputCode);
      
                }
              
            }
        }
    }
    */

    inputStrokeIsCorrect(inputCode) {
      let session = game.currentSession;
      session.negativeFeedbackState = false;
      game.getJiaYou();
      
      // add input stroke to thus far completed sequence:
      if (session.currentSequence != "") {
        session.currentSequence += ".";
      }
      session.currentSequence += inputCode;
      console.log("currentSequence: ", session.currentSequence);

      if (session.currentSequence == session.targetSequence) {
          // if entire targetSequence is complete
          this.trainingRepComplete();
          
      } else {
          // if input stroke is correct but target is not yet complete
          // move on to the next stroke of the target
          session.currentTargetStrokeNumber++;
      }
            
    }

    trainingRepComplete() {
        console.log("Training Rep Complete!");
        let session = game.currentSession;
        session.negativeFeedbackState = false;
        session.repsCompleted++;
        session.resetProgress();
        game.getJiaYou();
        if (session.repsCompleted >= session.repsRequired) {
          // all reps completed
          game.level.nextSession();
        } else {
          // do nothing, wait for more rep(s)
        }
    }

    handleFightingInput(inputCode) {
      let session = game.currentSession;
      
      // only need to check LEARNED/AVAILABLE chars
      
    }

    passLevel() {
        console.log("\nYou passed Level " + this.level.number + "\n");
        this.levelNumber++;
        if (levelBackgrounds[this.levelNumber] && levelPlans[this.levelNumber]) {
          clearScreen();
          this.createLevel();
        } else {
          console.log("NO MORE LEVELS");
        }
        
    }
  
  }
  
class Level {
    constructor(game, plan) {
        this.game = game;
        this.number = this.game.levelNumber;
        this.plan = plan;
        this.sessions = [];
        this.currentSessionNumber = 0;
        
        //if (this.number != 0) { this.drawBG() }; 
        
    }

    getSession() {
        this.game.currentSession = this.sessions[this.currentSessionNumber];
        this.game.currentSession.resetProgress();
        console.log("\nCurrent Session:", this.game.currentSession);
        if (this.game.currentSession instanceof FightingSession) {
            settings.writerCount = 1;
            turnOnInput();  
            this.spawnEnemies();
        } else if (this.game.currentSession instanceof TrainingSession) {
            // training session
            settings.writerCount = 3;
            turnOffInput(); 
        } else {
            // build
            settings.writerCount = 3;
            turnOffInput(); 
        }
    }

    nextSession() {
      console.log("Session complete!")
      this.currentSessionNumber++;
      if (this.sessions[this.currentSessionNumber]) {
        this.getSession();
      } else {
        game.passLevel();
      }
      
    }

  
    drawBG() {   
           
        for (let i = 0; i < levelBackgrounds[this.number].length; i++) {
          // for each image ID in this level's levelBackgrounds sublist
          let imgID = levelBackgrounds[this.number][i];
          
          let dataObj = backgroundSources.find(imageDataObj => imageDataObj.id === imgID);
          
            if (!dataObj.img) {
                console.log('Image not loaded yet: ' + dataObj.id);
            } else {
                //let imgID = dataObj.url;
                //let rotateYN= dataObj.rotateOnPortrait;
                //console.log("Data Obj: ", dataObj);
                drawScaledBackground(dataObj);//src, rotateYN);
            }
        }

        
    }

    drawOpeningText() {
      this.drawTopText();
      this.drawInfoText();
      this.drawInstructions();
      
    }


    drawTopText() {
        let session = game.currentSession;
        let text = "";
        let fontString = fonts['topText'];
        let y = dimensions.canvas_height * settings.topText_y;
        /*
            let qi = getCharAndPronunciation("qi");
            text = "Your " + qi + " is at Level " + this.number + ".";
        */
        
        
        if (session instanceof TrainingSession) {
            text = "Training"
        } else if (session instanceof FightingSession) {
            // fighting session - not yet built
            text = "Fight!"
            y = dimensions.canvas_height * settings.titleText1_y;
            fontString = fonts['titleSmall'];
        } else {
            // neither training nor fighting?
            //console.log("NO SESSION FOUND");
        }
      
        let x = dimensions.canvas_width * 0.5;
        let alignment = "center";
        this.game.drawText(text, x, y, alignment, fontString);
    }

    drawInfoText() {
      
        let session = game.currentSession;
        let text = "";
      
        if (session instanceof TrainingSession) {
            let goal = "";
          
            if (session.targetType == 'stroke') {
                let stroke = strokes.find(stroke => stroke.id === session.targetStroke);
                goal = stroke.nameEnglish;  
                if (settings.targetLanguage == 'zh_CN') {
                  goal += ` (${stroke.namePinyin})`
                }      
            } else if (session.targetType == 'char') {
                let char = getCharAndPronunciation(session.targetID);
                let eng = getEnglish(session.targetID);
                goal = `character ${char}: ${eng}`;
            }
          
            text = `Harness the power of the ${goal}`
            
        } else if (session instanceof FightingSession) {
            // fighting session - no info text

        } else {
            // neither training nor fighting?
          	//console.log("NO SESSION FOUND");
        }

        if (text != "") {
            let x = dimensions.canvas_width * 0.5;
            let y = dimensions.canvas_height * settings.infoText_y;
            let alignment = "center";
            let fontString = fonts['infoText'];
            game.drawText(text, x, y, alignment, fontString);
        }
        
      
      
    }

    drawInstructions() {
      let session = game.currentSession;
      let text = "";

      if (session instanceof TrainingSession) {

          let repsCompleted = session.repsCompleted;
          let repsLeft = session.repsRequired - repsCompleted;
          let suffix = (repsLeft >= 2) ? "s" : "";
  
          if (repsCompleted >= 1) {
          // after the first rep

          text = game.jiaYou;
          

          if (session.negativeFeedbackState) {
              text += " Try again."
              /*if (session.targetType == 'char' && session.currentSequence == '') {
                  text += " The whole character."
              }*/
          } else {
               
          }

          if (session.currentSequence == '') {
            text += " Just " + repsLeft + " more time" + suffix + "...";
          }
          
          
          
          } else {
            // first rep
            let targetStroke = session.targetStroke;
            let stroke = strokes.find(stroke => stroke.id === targetStroke);
    
            switch (session.targetType) {
    
              case 'stroke':
                if (stroke) {
                  text = stroke.trainingText + "...";
                } else if (targetStroke == "Enter") {
                  text = "Press Enter to continue..."
                } else {
                  text = "";
                }
                break;
                
              case 'char':
                let strokeCount = session.targetStrokesArray.length;
                let currentStrokeNum = session.currentTargetStrokeNumber + 1;
                session.getTargetStroke();
                let strokeName = session.getTargetStrokeName();
    
                text = "Stroke " + currentStrokeNum + " of " + strokeCount + ": " + strokeName;
                  
                break;
                
              default:
                console.log("ERROR: TARGET TYPE NOT FOUND");
                break;
    
                
            }
  
          }
        
      } else if (session instanceof FightingSession) {
        // fighting session - not yet built
        
        
      } else {
        // neither training nor fighting?
        //console.log("NO SESSION FOUND");
      }
        


      if (text != "") {
        let x = dimensions.canvas_width * 0.5;
        let y = dimensions.canvas_height * settings.instructions_y;
        let alignment = "center";
        let fontString = fonts['instructions'];
        game.drawText(text, x, y, alignment, fontString);
      }
      
    }


    spawnEnemies() {
      
    }

    

    buildSessions(plan) {
      //console.log("Building:", plan);
      let goalsArray = plan.split(',');
      
      for (let i = 0; i < goalsArray.length; i++) {
        // for each goal in the level
        let goal = goalsArray[i].split(':');

        let goalType = goal[0].trim();
        let target = goal[1].trim();
        let repsRequired = 1;
        if (goal[2]) {
          repsRequired = parseInt(goal[2]);
        }
        let newSession;

        if (goalType == "train") {
           newSession = new TrainingSession(target, repsRequired);
        } else if (goalType == "fight") {
           newSession = new FightingSession(target, repsRequired);
        } else if (goalType == "build") {
           newSession = new BuildingSession(target);
        } else {
          console.log('ERROR: GOAL TYPE UNDEFINED');
        }
        this.sessions.push(newSession);
        //console.log("Sessions:", this.sessions);
      }
    }

}

class FightingSession {
  constructor(target) {
    //this.currentSequence = "";
  }

  resetProgress() {
    //this.currentSequence = "";
      
  }
}

class BuildingSession {
  constructor(target) {

  }
}

class TrainingSession {
  constructor(target, repsRequired) {
    this.target = target;     // 'stroke_h'
    this.targetType;          // 'stroke', 'char'
    this.targetID;            // 'h', 'three'
    this.targetSequence;      // 'h', 'h.h.h'
    this.targetChar;          // '三'
    this.decomposeTarget();
    
    this.repsRequired = repsRequired;
    this.repsCompleted = 0;
    this.negativeFeedbackState = false;

    this.targetStrokesArray = this.getTargetStrokesArray(); // ['h']
    this.currentTargetStrokeNumber = 0;
    this.targetStrokeObject;
    this.targetStrokeForm;     // '一'
    this.targetStrokeName;
    this.targetStroke = this.getTargetStroke();             // 'h'
    
    this.quizTargetFull = this.getQuizTargetFull();         // '丨', '三'
    
    this.currentSequence = "";

    this.startQuiz();
  }

  decomposeTarget() {
    let array = this.target.split('_');  //********//
    this.targetType = array[0];          // 'stroke', 'char'
    this.targetID = array[1];            // 'h', 'three'

    switch (this.targetType) {
      case 'stroke':
        this.targetSequence = this.targetID + "";
        break;
      
      case 'char':
        this.targetChar = this.getTargetChar(); 
        this.targetSequence = getStrokes(this.targetID); 
        break;
      
      default:
        console.log("ERROR: NO TARGET TYPE");
        this.targetSequence = null; 
        break;
    }
  }


  getTargetStrokesArray() {
    let targetStrokesArray = this.targetSequence.split('.');
    
    this.targetStrokesArray = targetStrokesArray;
    //console.log(this.targetStrokesArray);
    return this.targetStrokesArray;
  }

  getTargetStroke() {
    this.targetStroke = this.targetStrokesArray[this.currentTargetStrokeNumber];
    this.targetStrokeObject = this.getTargetStrokeObject();
    this.targetStrokeForm = this.getTargetStrokeForm();     
    this.targetStrokeName = this.getTargetStrokeName();
    return this.targetStroke;
  }

  getTargetStrokeObject() {
    let stroke = strokes.find(stroke => stroke.id === this.targetStroke);
    this.targetStrokeObject = stroke;
    return this.targetStrokeObject;
  }

  getTargetStrokeForm() {
    this.targetStrokeForm = this.targetStrokeObject.form;
    return this.targetStrokeForm;
  }

  getTargetStrokeName() {
    this.targetStrokeName = this.targetStrokeObject.nameEnglish;
    return this.targetStrokeName;
  }

  getTargetChar() {
    let id = this.targetID;
    this.targetChar = getChar(id);
    return this.targetChar;
  }

  getQuizTargetFull() {
      let target;

      if (this.targetType == 'char') {
          // char
          target = this.getTargetChar();
      } else {
          // stroke
          target = this.getTargetStrokeForm();
      }

      this.quizTargetFull = target;
      return target;
    }
      

  resetProgress() {
      this.currentSequence = "";
      this.currentTargetStrokeNumber = 0;
      if (this.targetStrokesArray.length > 1) {
        console.log("currentSequence: ", this.currentSequence);
      }

      this.getTargetStroke();
      this.startQuiz();
      
  }


  startQuiz() {
      overlayCharacterQuiz(this.quizTargetFull, 2);
  }

  
}





class Stroke {
  constructor(id, form, nameEnglish, namePinyin, trainingText) {
    this.id = id;
    this.form = form;
    this.nameEnglish = nameEnglish;
    this.namePinyin = namePinyin;
    this.trainingText = trainingText;
  }
}


class Component {
  constructor(strokeArray) {
    this.strokes = strokeArray;
  }
}


class Character {
  constructor(componentArray) {
    this.components = componentArray;
  }
}
 
  



// CANVAS ------------------------------------------------


function checkForPortraitMode() {
    if (window.innerHeight > window.innerWidth) {
        settings.portrait_mode = true;
    } else {
        settings.portrait_mode = false;
    }
}

function updateDimensions() {

    if (settings.portrait_mode) {
        dimensions.canvas_width = window.innerWidth * settings.canvas_w_percent;
        dimensions.canvas_height = window.innerWidth * settings.canvas_w_percent / settings.canvas_h_w_ratio;
    } else {
        dimensions.canvas_width = window.innerWidth * settings.canvas_w_percent;
        dimensions.canvas_height = window.innerWidth * settings.canvas_w_percent * settings.canvas_h_w_ratio;
    }

    while ((dimensions.canvas_width > window.innerWidth * settings.canvas_w_correction) || (dimensions.canvas_height > window.innerHeight * settings.canvas_h_correction * (1 - 2 * settings.top_margin_percent))) {
        dimensions.canvas_height *= 0.99;
        dimensions.canvas_width *= 0.99;
    }

    canvas.style.left = Math.floor((window.innerWidth * settings.canvas_w_correction - dimensions.canvas_width) / 2) + "px"
    canvas.style.top = Math.floor((window.innerHeight * settings.canvas_h_correction - dimensions.canvas_height) / 2) + "px"
    
}

function resizeCanvas() {
    if (onHomeScreen) {
      adjustHomeScreenSize();
    } 

    if (game) {
      game.needsResized = true;
    }
}


function setCanvasSize() {
    checkForPortraitMode();
    updateDimensions();
    updateFontSizes();
    adjustOverlay();
    //console.log(dimensions.canvas_width, dimensions.canvas_height);
    canvas.setAttribute('width', dimensions.canvas_width);
    canvas.setAttribute('height', dimensions.canvas_height);
    //canvas.style.marginTop = Math.round(window.innerHeight * settings.top_margin_percent) + 'px';
    //canvas.style.top = Math.round(window.innerHeight * settings.top_margin_percent) + 'px';
    //canvas.style.marginBottom = Math.round(window.innerHeight * settings.top_margin_percent) + 'px';

    //clearScreen();

    
  
    
}
 


function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas1');
    let div = document.getElementById('canvas-wrap');
    div.appendChild(canvas); 
    //canvas.style.position = 'absolute';
    setCanvasSize();
    context = canvas.getContext('2d');
    canvas.style.backgroundColor = settings.canvas_bg_color;
    canvas.style.zIndex = 1;
    clearScreen();
    adjustOverlay();

}


function adjustOverlay() {

    getOverlaySizes();

    let divs = document.getElementsByClassName('overlay'); 

    
    if (settings.writerCount == 3) {
        //console.log("count is 3");
    
        for (let i = 0; i < divs.length; i++) {
            let div = divs[i];
            let yOffset = 0;
            
            if (onHomeScreen) {
              yOffset -=  touchArea.height / 2;
            }
    
            if (settings.portrait_mode) {
              div.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - (dimensions.overlaySize)) / 2) + 'px';
              div.style.top = Math.floor((window.innerHeight - 3 * dimensions.overlaySize) / 2 + yOffset) + "px";
              div.style.marginLeft = 0;
              div.style.marginTop = Math.floor(dimensions.overlaySize * i) + "px";
            } else {
              div.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - (3 * dimensions.overlaySize)) / 2) + 'px';
              div.style.top = Math.floor((window.innerHeight - dimensions.overlaySize) / 2 + yOffset) + "px";
              div.style.marginLeft = Math.floor(dimensions.overlaySize * i) + "px";
              div.style.marginTop = 0;
            }
        }
    
        for (let j = 0; j < writers.length; j++) {
            let writer = writers[j];
            writer.updateDimensions(options = {
                width: dimensions.overlaySize,
                height: dimensions.overlaySize
            });
        }

    } else if (settings.writerCount == 1) { // doesn't work perfectly but i'm actually using it
        //console.log("count is 1");

        let bigOverlaySize = dimensions.overlaySize * settings.singleOverlayMultiplier;
        let smallOverlaySize = dimensions.overlaySize * (1 - bigOverlaySize) / 2;

        //****** 

        for (let i = 0; i < divs.length; i++) {
            let div = divs[i];
            let yOffset = 0;
            
            if (onHomeScreen) {
              yOffset -= touchArea.height / 2;
            }

    
            if (settings.portrait_mode) {
              // portrait mode
              div.style.top = Math.floor((window.innerHeight - 2 * smallOverlaySize - bigOverlaySize) / 2 + yOffset) + "px";
              div.style.marginLeft = 0;
              if (i != 1) {
                //outer overlays
                div.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - (smallOverlaySize)) / 2) + 'px';
                div.style.marginTop = ( (i == 0) ? 0 : Math.floor(smallOverlaySize + bigOverlaySize) ) + "px";
              } else {
                //middle overlay
                div.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - (bigOverlaySize)) / 2) + 'px';
                div.style.marginTop = Math.floor(smallOverlaySize) + "px";
              }

            } else {
              // landscape mode
              div.style.left = Math.round((window.innerWidth - 2 * smallOverlaySize - bigOverlaySize) / 2) + 'px';
              div.style.marginTop = 0;

              if (i != 1) {
                //outer overlays
                div.style.marginLeft = ( (i == 0) ? 0 : Math.floor(smallOverlaySize + bigOverlaySize)) + "px";
                div.style.top = Math.floor((window.innerHeight - smallOverlaySize) / 2 + yOffset) + "px";
              } else {
                //middle overlay
                div.style.marginLeft = Math.floor(smallOverlaySize) + "px";
                div.style.top = Math.floor((window.innerHeight - bigOverlaySize) / 2 + yOffset) + "px";
              }

              
              
              
            }
        }
    
        for (let j = 0; j < writers.length; j++) {
            let writer = writers[j];
            if (j != 1) {
                // outer overlays
                writer.updateDimensions(options = {
                    width: smallOverlaySize,
                    height: smallOverlaySize,
                });
            } else {
                //middle overlay
                writer.updateDimensions(options = {
                    width: bigOverlaySize,
                    height: bigOverlaySize
                });
            }
            
        }
    
    } else {
        console.log("ERROR: ONLY SET UP FOR 1 or 3 WRITERS")
    }
    


    // input overlay divs

    let inputDiv = document.getElementById("input-overlay");
    let clearDiv = document.getElementById("cmdClear");
    let undoDiv = document.getElementById("cmdUndo");
    let oneResultDiv = document.getElementById("oneResult");
    let ifResultDiv = document.getElementById("ifResult");

    if (allowInput) {
      let y_offset = 0;    
      if (onHomeScreen) {
        y_offset -=  touchArea.height / 2;
      }

      
      inputDiv.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - (dimensions.inputOverlaySize)) / 2) + 'px';
      inputDiv.style.top = Math.floor((window.innerHeight - dimensions.inputOverlaySize) / 2 + y_offset) + "px";
      inputDiv.style.width = dimensions.inputOverlaySize + 'px';
      inputDiv.style.height = dimensions.inputOverlaySize + 'px';
      inputDiv.style.border = "10px dotted black";

      
      dimensions.inputButton_W = dimensions.canvas_width * settings.inputButton_height;
      dimensions.inputButton_H = dimensions.canvas_height * settings.inputButton_width;
      clearDiv.style.width = Math.floor(dimensions.inputButton_W) + "px"
      clearDiv.style.height = Math.floor(dimensions.inputButton_H) + "px"
      clearDiv.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - 3 * (dimensions.inputButton_W)) / 2) + 'px';
      clearDiv.style.top = Math.floor((window.innerHeight - dimensions.canvas_height) / 2 + dimensions.canvas_height * settings.inputButton_y) + "px";
      clearDiv.style.lineHeight = Math.floor(dimensions.inputButton_H) + "px";
      
      undoDiv.style.width = Math.floor(dimensions.inputButton_W) + "px"
      undoDiv.style.height = Math.floor(dimensions.inputButton_H) + "px"
      undoDiv.style.left = Math.round((window.innerWidth * settings.canvas_w_correction + (dimensions.inputButton_W)) / 2) + 'px';
      undoDiv.style.top = Math.floor((window.innerHeight - dimensions.canvas_height) / 2 + dimensions.canvas_height * settings.inputButton_y) + "px";
      undoDiv.style.lineHeight = Math.floor(dimensions.inputButton_H) + "px";

      
      dimensions.inputResultSize = dimensions.canvas_width * settings.inputResult_size;
      oneResultDiv.style.width = Math.floor(dimensions.inputResultSize) + "px"
      oneResultDiv.style.height = Math.floor(dimensions.inputResultSize) + "px"
      oneResultDiv.style.left = Math.round((window.innerWidth * settings.canvas_w_correction - 3 * (dimensions.inputResultSize)) / 2) + 'px';
      oneResultDiv.style.top = Math.floor((window.innerHeight - dimensions.canvas_height) / 2 + dimensions.canvas_height * settings.inputResult_y) + "px";
      oneResultDiv.style.lineHeight = Math.floor(dimensions.inputResultSize) + "px";

      
      ifResultDiv.style.width = Math.floor(dimensions.inputResultSize) + "px"
      ifResultDiv.style.height = Math.floor(dimensions.inputResultSize) + "px"
      ifResultDiv.style.left = Math.round((window.innerWidth * settings.canvas_w_correction + (dimensions.inputResultSize)) / 2) + 'px';
      ifResultDiv.style.top = Math.floor((window.innerHeight - dimensions.canvas_height) / 2 + dimensions.canvas_height * settings.inputResult_y) + "px";
      ifResultDiv.style.lineHeight = Math.floor(dimensions.inputResultSize) + "px";
    
    } else {
      // allowInput = false

      
      inputDiv.style.width = '0px';
      inputDiv.style.height = '0px';
      inputDiv.style.border = "0px dotted black";


      dimensions.inputButton_W = 0;
      dimensions.inputButton_H = 0;
      clearDiv.style.width = Math.floor(dimensions.inputButton_W) + "px";
      clearDiv.style.height = Math.floor(dimensions.inputButton_H) + "px";
      clearDiv.style.lineHeight = Math.floor(dimensions.inputButton_H) + "px";
      undoDiv.style.width = Math.floor(dimensions.inputButton_W) + "px";
      undoDiv.style.height = Math.floor(dimensions.inputButton_H) + "px";
      undoDiv.style.lineHeight = Math.floor(dimensions.inputButton_H) + "px";

      dimensions.inputResultSize = 0;
      oneResultDiv.style.width = Math.floor(dimensions.inputResultSize) + "px";
      oneResultDiv.style.height = Math.floor(dimensions.inputResultSize) + "px";
      oneResultDiv.style.lineHeight = Math.floor(dimensions.inputResultSize) + "px";
      ifResultDiv.style.width = Math.floor(dimensions.inputResultSize) + "px";
      ifResultDiv.style.height = Math.floor(dimensions.inputResultSize) + "px";
      ifResultDiv.style.lineHeight = Math.floor(dimensions.inputResultSize) + "px";
    }
}


// DRAW --------------------------------------------------

function clearScreen() {
  for (let j = 0; j < writers.length; j++) {
      let writer = writers[j];
      //writer.hideCharacter();
  }
  context.save();
  context.fillStyle = settings.canvas_bg_color;
  context.fillRect(0,0,dimensions.canvas_width, dimensions.canvas_height);
  context.restore();
}

function drawBackground(img, x1, y1, w, h) {
    context.drawImage(img, 0, 0, img.width, img.height, x1, y1, w, h);
}

function drawRotatedBackground(img, x1, y1, w, h, degrees){
    context.save();
    context.translate(dimensions.canvas_width / 2, dimensions.canvas_height / 2);
    context.rotate(degrees * Math.PI/180);
    context.translate(-dimensions.canvas_width / 2, -dimensions.canvas_height / 2);
    context.drawImage(img, 0, 0, img.width, img.height, x1, y1, w, h);
    context.restore();
}



function drawScaledBackground(imageDataObj) {

    let img = imageDataObj.img;

    if (img) {
        var ratio; 
        var x1 = 0;
        var y1 = 0;
        var destination_width;
        var destination_height;
        var degrees = 0;

        if (settings.portrait_mode && imageDataObj.rotateOnPortrait) {
            var hwRatio = dimensions.canvas_height  / img.width;
            var whRatio =  dimensions.canvas_width / img.height; 
            ratio = Math.min(hwRatio, whRatio) * imageDataObj.ratio; 
            destination_width = img.width * ratio;
            destination_height = img.height * ratio;
            degrees = 90;
        } else {
          var hRatio = dimensions.canvas_width  / img.width;
          var vRatio =  dimensions.canvas_height / img.height;
          ratio = Math.min(hRatio, vRatio) * imageDataObj.ratio; 
          destination_width = img.width * ratio;
          destination_height = img.height * ratio;
        }

        switch (imageDataObj.align) {
            case 'top_left': 
                x1 = 0;
                y1 = 0;
                break;
            case 'top_center':
                x1 = (dimensions.canvas_width - destination_width) / 2;
                y1 = 0;
            case 'top_right':
                x1 = dimensions.canvas_width - destination_width;
                y1 = 0;
                break;

            case 'center_left':
                x1 = 0;
                y1 = (dimensions.canvas_height - destination_height) /2;
                break;
            case 'center':
                x1 = (dimensions.canvas_width - destination_width) / 2;
                y1 = (dimensions.canvas_height - destination_height) /2;
                break;
            case 'center_right':
                x1 = dimensions.canvas_width - destination_width;
                y1 = (dimensions.canvas_height - destination_height) /2;
                break;

            case 'bottom_left': 
                x1 = 0;
                y1 = dimensions.canvas_height - destination_height;;
                break;
            case 'bottom_center':
                x1 = (dimensions.canvas_width - destination_width) / 2;
                y1 = dimensions.canvas_height - destination_height;;
            case 'bottom_right':
                x1 = dimensions.canvas_width - destination_width;
                y1 = dimensions.canvas_height - destination_height;
                break;

            default:
                console.log("ERROR: NO ALIGNMENT");
                break;
        }
        drawRotatedBackground(img, x1, y1, destination_width, destination_height, degrees); 
    } 
    
}



function drawSegment(x1, y1, x2, y2, width, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    
}


function drawGame() {
    if (game.needsResized) {
      setCanvasSize();
      game.needsResized = false;
    }
    game.level.drawBG();
    game.animate();
  
}



// EVENT LISTENERS ---------------------------------------

function addListener(item, type, callback) {
    item.addEventListener(type, callback, true);
};

function createEventListeners() {
    addListener(window, "resize", resizeCanvas);
    addListener(document, "keydown", handleKeyDown);
    addListener(canvas, "click", function(evt) {
        var mousePos = getMousePos(evt);
        console.log(mousePos.x, mousePos.y);
    
        if (isInside(mousePos, touchArea)) {
            clickedInArea();
        }else{
            //console.log('Clicked outside the touch area');
        } 

        if (isInside(mousePos, fullScreenControl)) {
          console.log("Clicked in Full Screen Control Area");
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        } else {
          console.log('Clicked outside the Full Screen Control area');
        }
    });

}

function handleKeyDown(e) {
  //console.log("Pressed: Key: " + e.key + " Code: " + e.code);

  /*
  if (game && game.wantsNextStroke) {
    game.handleInput(e.key);        // later, convert raw code to custom stroke id code
  }
  */

}


function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

function clickedInArea() {
    console.log("Clicked inside the area.")
    if (onHomeScreen) {
        onHomeScreen = false;
        launchGame();
    }
}

var touchArea = {
    x: 0,
    y: dimensions.canvas_height * (1 - settings.touchAreaHeight),
    width: dimensions.canvas_width,
    height: dimensions.canvas_height * settings.touchAreaHeight
};

var fullScreenControl = {
  x: 0,
  y: 0,
  width: settings.fullScreenControl_size * dimensions.canvas_width,
  height: settings.fullScreenControl_size * dimensions.canvas_width,
};

function setTouchAreaSize() {
    touchArea.x = 0,
    touchArea.y = dimensions.canvas_height * 0.80,
    touchArea.width = dimensions.canvas_width,
    touchArea.height = dimensions.canvas_height * 0.20
}

// HOME SCREEN  ----------------------

function emptyWriters() {
    writer1.setCharacter('');
    writer2.setCharacter('');
    writer3.setCharacter('');
}

function adjustHomeScreenSize() {
    setCanvasSize();
    emptyWriters();
    drawHomeBackground();
    setTouchAreaSize();
    drawTouchToStartBanner();
    drawFullScreenControl();
    if (settings.portrait_mode) { 
      let char1 = getChar('pen');
      overlayCharacterLoop(char1, '1');
      let char2 = getChar('paint');
      overlayCharacterLoop(char2, '2');
      let char3 = getChar('overlord');
      overlayCharacterLoop(char3, '3');
      //overlayChainAnimations([char1, char2, char3]); // doesn't work
    } else {
      drawTitleText();
    }
}

function drawHomeBackground() {
    context.fillStyle = settings.home_screen_bg_color;
    context.fillRect(0, 0, dimensions.canvas_width, dimensions.canvas_height);
}

function drawTitleText() {
    var titleText = "";
    //titleText += getChar("han_chinese");
    //titleText += getChar("character");
    titleText += getChar("pen");
    titleText += getChar("paint");
    titleText += getChar("overlord");
    var titleTextX = dimensions.canvas_width * 0.50;
    var titleTextY = dimensions.canvas_height * settings.titleText1_y;

    context.fillStyle = settings.text_color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = fonts.titleLarge;
    context.fillText(titleText, titleTextX, titleTextY);
  
    titleText = "StrokeFighter";
    titleTextY = dimensions.canvas_height * settings.titleText2_y;
    context.save();
    context.translate(dimensions.canvas_width/2, dimensions.canvas_height/2);
    context.rotate(-0.2);
    context.translate(-dimensions.canvas_width/2, -dimensions.canvas_height/2);
    context.fillStyle = settings.highlight_text_color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = fonts.titleSmall;
    context.fillText(titleText, titleTextX, titleTextY);
    context.restore();
}

function drawTouchToStartBanner() {
    context.fillStyle = settings.touch_area_color;
    context.fillRect(touchArea.x, touchArea.y, touchArea.width, touchArea.height);

    var clickText = "Touch here to start";
    var clickTextX = touchArea.x + (touchArea.width * 0.50);
    var clickTextY = touchArea.y + (touchArea.height * 0.50);
    context.fillStyle = settings.home_screen_bg_color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = fonts.clickToStart;
    context.fillText(clickText, clickTextX, clickTextY);
}

function drawFullScreenControl() {
    let img = backgroundSources.find(pic => pic.id === 'full_screen_chop');
    if(img.img) {
        context.drawImage(img.img, fullScreenControl.x, fullScreenControl.y, fullScreenControl.width, fullScreenControl.height);
    }
}

function launchHomeScreen() {
    onHomeScreen = true;
    adjustHomeScreenSize();

}

function launchGame() {
    game = new Game();
    drawGame();
    update();
}

// BACKGROUNDS -------------------

function loadBackgrounds() {
    
  
    for (let i = 0; i < backgroundSources.length; i++) {
  
        //console.log("Loading bg image " + i + "...");
        let img = new Image();

        img.addEventListener('load', function() {
            backgroundSources[i].img = img;
            
            //console.log("Loaded background image " + i + ": " + backgroundSources[i].id);
    
            if (i == 0 && onHomeScreen) {     // full_screen_chop, used on home screen
                launchHomeScreen();
            }

        });

        let div = document.getElementById('canvas-wrap');
        div.appendChild.img;
        img.src = backgroundSources[i].url;


    }

    
          
}

// FONTS ------------------

function loadFonts() {
    /*
    var fontLiuJianMaoCao = new FontFace('LiuJianMaoCao', 'url(fonts/LiuJianMaoCao-Regular.ttf)');
    fontLiuJianMaoCao.load().then(function(font){
      document.fonts.add(font);
      console.log('Font loaded');
      adjustHomeScreenSize();
    });
    */
    var fontSTXingKai = new FontFace('STXingKai', 'url(fonts/STXINGKA.TTF)');
    fontSTXingKai.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded');
      adjustHomeScreenSize();
    });
    var fontRockSalt = new FontFace('RockSalt', 'url(fonts/RockSalt-Regular.ttf)');
    fontRockSalt.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded');
      adjustHomeScreenSize();
    });
    var fontMali= new FontFace('Mali', 'url(fonts/Mali-Regular.ttf)');
    fontMali.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded: Mali');
      adjustHomeScreenSize();
    });
    
    var fontAnnie = new FontFace('Annie', 'url(fonts/AnnieUseYourTelescope-Regular.ttf)');
    fontAnnie.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded');
      adjustHomeScreenSize();
    });
    var fontArimaMadurai = new FontFace('Arima', 'url(fonts/ArimaMadurai-Regular.ttf)');
    fontArimaMadurai.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded: Arima');
      adjustHomeScreenSize();
    });
    var fontComforterBrush = new FontFace('ComforterBrush', 'url(fonts/ComforterBrush-Regular.ttf)');
    fontComforterBrush.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded: Comforter Brush');
      adjustHomeScreenSize();
    });
    var fontDekko = new FontFace('Dekko', 'url(fonts/Dekko-Regular.ttf)');
    fontDekko.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded: Dekko');
      adjustHomeScreenSize();
    });
    
    var fontSriracha = new FontFace('Sriracha', 'url(fonts/Sriracha-Regular.ttf)');
    fontSriracha.load().then(function(font){
      document.fonts.add(font);
      //console.log('Font loaded: Sriracha');
      adjustHomeScreenSize();
    });
    
}


// ANIMATION ----------------------------------------

function update() {
    clearScreen();
    drawGame();
    window.requestAnimationFrame(update);
}


// START FUNCTION ---------------------------------------


function start() {
    loadFonts();
    createCanvas();
    createEventListeners();
    loadBackgrounds();
    launchHomeScreen();

}



// RUN ---------------------------------------

start();
