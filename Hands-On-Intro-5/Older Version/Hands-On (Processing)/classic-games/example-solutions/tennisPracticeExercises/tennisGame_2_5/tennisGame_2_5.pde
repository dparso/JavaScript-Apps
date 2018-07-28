/* Hands-On Game Programming
 * By Chris DeLeon
 *
 * Commercial educational example. Do not distribute source.
 *
 * Feel free to use this code as a starting point or as scrap
 * parts to harvest from. Your compiled program using the
 * derivative code can be distributed, for free or commercially,
 * without any attribution or mention of Chris DeLeon.
 * (unless used for school - then make clear which work is yours!)
 */
 
import ddf.minim.*; // using Minim to play sound effects
Minim minim;

AudioSample sndHit, sndScore, sndEnd,
            sndStart, sndWall;

PImage imgBackground, imgBall,
       imgPaddleLeft, imgPaddleRight;
 
boolean reflectInsteadOfAim = false;

boolean AI_for_P2 = false;
float paddle2KeyMoveSpeed = 0.0; // smooth P2 key moves
float PADDLE_2_KEY_MOVE_INC = 6.5; // P2 key accel
float PADDLE_2_KEY_MOVE_MAX = 18.0; // P2 key accel
float PADDLE_2_KEY_MOVE_DECAY = 0.88; // % slowdown/frame 

// how far are paddles from the edge?
float PADDLE_DIST_FROM_EDGE = 90.0;
// if too thin the ball may 'tunnel' through when fast
float PADDLE_COLLISION_THICKNESS = 20.0;

// tuning values to simplify tweaks to ball speed increase
float AI_PADDLE_MOVE_SPEED = 9.5;
float BALL_REFLECT_Y_SPEED_PROPORTION = 0.18; 

// ball values
float ballX = 100, ballY = 100;
float ballSpeedX = 6.0, ballSpeedY = 4.0;
float ballSpeedMult = 1.0; // increases during play
float BALL_SPEED_MULT_INC = 0.1; // incease per hit
float BALL_SPEED_MULT_MAX = 2.25; // keep speed sane

// paddle values
float paddle1Y = 100.0, paddle2Y = 100.0;
float PADDLE_HEIGHT = 100.0;

// score values
int scoreP1 = 0, scoreP2 = 0;
int PLAY_TIL_SCORE = 3;

void setup() { // setup() happens once at program start
  size(800,600);
 
  imgBackground = loadImage("bg.png");
  imgBall = loadImage("ball.png");
  imgPaddleLeft = loadImage("paddleLeft.png");
  imgPaddleRight = loadImage("paddleRight.png");
 
  int buffersize = 256;
  minim = new Minim(this);
  sndHit = minim.loadSample("hit.wav", buffersize);
  sndScore = minim.loadSample("score.wav", buffersize);
  sndEnd = minim.loadSample("end.wav", buffersize);
  sndStart = minim.loadSample("start.wav", buffersize);
  sndWall = minim.loadSample("wall.wav", buffersize);
  
  // by default text() calls left align, but this next call
  // means all text() calls in the program will center text
  textAlign(CENTER);
}

void draw() { // draw() happens every frame (automatically)
  // erase what the previous frame drew
  image(imgBackground,0,0);
        
  fill(255,255,255); // set fill to white for remaining graphics
  
  if(scoreP1 >= PLAY_TIL_SCORE)  {
    text("Player 1 Wins!\nClick to restart",
         width/2,height/2);
    resetUponNextClick();
  } else if(scoreP2 >= PLAY_TIL_SCORE)  {
    text("Player 2 Wins!\nClick to restart",
         width/2,height/2);
     resetUponNextClick();
  } else { // neither player has enough points, keep playing
    moveAndDrawLeftPaddle();
    
    moveAndDrawRightPaddle();
    
    moveAndDrawBall();
  }
  
  // display scores
  text(scoreP1,width/2-15,15);
  text(scoreP2,width/2+15,15);
  
  // check the ball against the screen edges
  boundsAndPaddleCheck();
}

void moveAndDrawLeftPaddle() {
  paddle1Y = mouseY - (PADDLE_HEIGHT/2);
  image(imgPaddleLeft,PADDLE_DIST_FROM_EDGE,paddle1Y);

}

void moveAndDrawRightPaddle() {
  if(AI_for_P2) {
    float AItargetY = ballY- (PADDLE_HEIGHT/2);
    
    if(paddle2Y < AItargetY-35.0) {
       paddle2Y += AI_PADDLE_MOVE_SPEED;
    }
    else if(paddle2Y > AItargetY+35.0) {
       paddle2Y -= AI_PADDLE_MOVE_SPEED;
    }
  } else {
    // see keyHandling tab/file for upHeld & downHeld
    if(upHeld) {
      paddle2KeyMoveSpeed = -PADDLE_2_KEY_MOVE_INC;
      if(paddle2KeyMoveSpeed < -PADDLE_2_KEY_MOVE_MAX) {
        paddle2KeyMoveSpeed = -PADDLE_2_KEY_MOVE_MAX;
      }
    } else if(downHeld) {
      paddle2KeyMoveSpeed = PADDLE_2_KEY_MOVE_INC;
      if(paddle2KeyMoveSpeed > PADDLE_2_KEY_MOVE_MAX) {
        paddle2KeyMoveSpeed = PADDLE_2_KEY_MOVE_MAX;
      }
    } else { // smoothly slow down speed after key release
      paddle2KeyMoveSpeed *= PADDLE_2_KEY_MOVE_DECAY;
    }
    
    paddle2Y += paddle2KeyMoveSpeed;
    
    // block the paddle from going off screen
    if(paddle2Y < -imgPaddleRight.height/2) {
      paddle2Y = -imgPaddleRight.height/2;
    }
    if(paddle2Y > height-imgPaddleRight.height/2) {
      paddle2Y = height-imgPaddleRight.height/2;
    }
  }
  
  image(imgPaddleRight,
        width-imgPaddleRight.width-PADDLE_DIST_FROM_EDGE,
        paddle2Y);
}

void moveAndDrawBall() {
  // move and draw ball
  ballX += ballSpeedX * ballSpeedMult;
  ballY += ballSpeedY * ballSpeedMult;

  image(imgBall,ballX-10,ballY-10);
}

void ballReset() {
  // reverse ball heading, so whoever scored a point serves
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 0.0;
  
  ballSpeedMult = 1.0; // slow back down start speed
  
  // center ball on screen
  ballX = width/2;
  ballY = height/2;
}

void ballSpeedUp() {
  ballSpeedMult += BALL_SPEED_MULT_INC;
  if(ballSpeedMult > BALL_SPEED_MULT_MAX) {
    ballSpeedMult = BALL_SPEED_MULT_MAX;
  }
}

void soundForGoalOrEnd() {
  if(scoreP1 >= PLAY_TIL_SCORE ||
     scoreP2 >= PLAY_TIL_SCORE)  {
    sndEnd.trigger();
  } else {
    sndScore.trigger();
  }
}

// bounce ball off top/bottom edges and paddles
void boundsAndPaddleCheck() {
  float paddle2X = width-PADDLE_DIST_FROM_EDGE;
  float distFromPaddle2 = abs(paddle2X-ballX);
  
  if(distFromPaddle2 < PADDLE_COLLISION_THICKNESS) {
    // ball is lined up with paddle 2 horizontally
    // now let's see whether it's vertically lined up
    if(ballY > paddle2Y &&
       ballY < paddle2Y+PADDLE_HEIGHT) {
      // then p2 hit the ball, so flip its horizontal heading
      ballSpeedX = -ballSpeedX;
      ballSpeedUp();
      sndHit.trigger();

      if(reflectInsteadOfAim == false) {
      // and set y speed based on distance from paddle center
        float deltaY = ballY-(paddle2Y+PADDLE_HEIGHT/2);
        ballSpeedY = deltaY * BALL_REFLECT_Y_SPEED_PROPORTION;
      }
    }
  }
  
  if(ballX > width) { // ball went past right edge
    scoreP1++;
    soundForGoalOrEnd();
    ballReset();
  }

  float paddle1X = PADDLE_DIST_FROM_EDGE;
  float distFromPaddle1 = abs(paddle1X-ballX);
  
  if(distFromPaddle1 < PADDLE_COLLISION_THICKNESS) {
    // ball is lined up with paddle 1 horizontally
    // now let's see whether it's vertically lined up
    if(ballY > paddle1Y &&
       ballY < paddle1Y+PADDLE_HEIGHT)
    {
      // then p1 hit the ball, so flip its horizontal heading
      ballSpeedX = -ballSpeedX;
      ballSpeedUp();
      sndHit.trigger();
      
      if(reflectInsteadOfAim == false) {
      // and set y speed based on distance from paddle center
        float deltaY = ballY-(paddle1Y+PADDLE_HEIGHT/2);
        ballSpeedY = deltaY * BALL_REFLECT_Y_SPEED_PROPORTION;
      }
    }
  }
  
  if(ballX < 0) { // ball went past left edge
    scoreP2++;
    soundForGoalOrEnd();
    ballReset();
  }
  
  if(ballY > height) { // ball bouncing off bottom
    ballSpeedY = -ballSpeedY;
    sndWall.trigger();
  }
  if(ballY < 0) { // ball bouncing off top
    ballSpeedY = -ballSpeedY;
    sndWall.trigger();
  }
}

// net is part of background image! Removed function:
// void drawNet() { }

// called when either player has enough points to have won
void resetUponNextClick() {
  if(mousePressed) { // true only when mouse button is down
    scoreP1 = scoreP2 = 0; // reset scores
    sndStart.trigger();
    ballReset(); // reset the ball
  }
}

