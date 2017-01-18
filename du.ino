

int cursor = 0;
char message[12];
char cmd[4];
char pin[4];
char val[4];

bool debug = true;

void setup() {
  Serial.begin(9600);
}

void loop() {
  while(Serial.available() > 0) {
    char x = Serial.read();
    if (x == '!') cursor = 0;     // start
    else if (x == '.') process(); // end
    else message[cursor++] = x;
  }
}

/*
 * Deal with a full message and determine function to call
 */
void process() {
  cursor = 0;
  Serial.println(message);
  strncpy(cmd, &message[0], 3);
  cmd[3] = '\0';
  strncpy(pin, &message[3], 3);
  pin[3] = '\0';
  strncpy(val, &message[6], 3);
  val[3] = '\0';
  int cmdid = atoi(cmd);
  int pinid = getPin(pin); 
  if(debug){
    Serial.print("cmd: ");
    Serial.println(cmdid);
    Serial.print("pin: ");
    Serial.println(pin);
    Serial.print("val: ");
    Serial.println(val);
  }
  switch(cmdid) {
    case 1:  sm(pinid,val); break;
    case 2:  dr(pinid,val); break;
    case 3:  dw(pinid,val); break;
    case 4:  ar(pinid,val); break;
    case 5:  aw(pinid,val); break;
    default:                break;
  }
}

/**
 * getPin Converts to A0-A5, and returns -1 on error
 * @param  pin
 * @return
 */
int getPin(char *pin) {
  int ret = -1;
  if(pin[0] == 'A' || pin[0] == 'a') {
    switch(pin[1]) {
      case '0':  ret = A0; break;
      case '1':  ret = A1; break;
      case '2':  ret = A2; break;
      case '3':  ret = A3; break;
      case '4':  ret = A4; break;
      case '5':  ret = A5; break;
      default:             break;
    }
  } else {
    ret = atoi(pin);
    if(ret == 0 && (pin[0] != '0' || pin[1] != '0')) {
      ret = -1;
    }
  }
  return ret;
}

/*
 * Set pin mode
 */
void sm(int pin, char *val) {
  if (debug) Serial.println("sm");
  if (atoi(val) == 0) {
    pinMode(pin, OUTPUT);
  } else {
    pinMode(pin, INPUT);
  }
}

/*
 * Digital write
 */
void dw(int pin, char *val) {
  if (debug) Serial.println("dw");
  if (atoi(val) == 0) {
    digitalWrite(pin, LOW);
  } else {
    digitalWrite(pin, HIGH);
  }
}

/*
 * Digital read
 */
void dr(int pin, char *val) {
  if (debug) Serial.println("dr");
  int oraw = digitalRead(pin);
  char m[7];
  sprintf(m, "%02d::%02d", pin,oraw);
  Serial.println(m);
}

/*
 * Analog read
 */
void ar(int pin, char *val) {
  if(debug) Serial.println("ar");
  int rval = analogRead(pin);
  char m[8];
  sprintf(m, "%s::%03d", pin, rval);
  Serial.println(m);
}

void aw(int pin, char *val) {
  if(debug) Serial.println("aw");
  analogWrite(pin,atoi(val));
}