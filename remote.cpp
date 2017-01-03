#include <string>
#include <cstdlib>
#include <getopt.h>
#include <sstream>
#include <iostream>
#include <RF24/RF24.h>

using namespace std;
//RF24 radio("/dev/spidev0.0",8000000 , 25);  
//RF24 radio(RPI_V2_GPIO_P1_15, RPI_V2_GPIO_P1_24, BCM2835_SPI_SPEED_8MHZ);

RF24 radio(RPI_V2_GPIO_P1_22, RPI_V2_GPIO_P1_24, BCM2835_SPI_SPEED_8MHZ);
//const int role_pin = 7;
const uint64_t pipes[2] = { 100, 80 };
//const uint8_t pipes[][6] = {"1Node","2Node"};

char got_message[3][11];

void setup(void){
	//Prepare the radio module
	printf("\nPreparing interface\n");
	radio.begin();
	radio.setRetries( 15, 15);
	//	radio.setChannel(0x4c);
	//	radio.setPALevel(RF24_PA_MAX);

	radio.printDetails();
	radio.openWritingPipe(pipes[0]);
	radio.openReadingPipe(1,pipes[1]);
	//	radio.startListening();

}


int main( int argc, char ** argv){
	bool switched = true;
	while (switched){
		if(radio.available()){
			radio.read( &got_message, sizeof(got_message) );
			printf("Yay! Got this response %p.\n\r",got_message);
			switched = false;
		}
	}
	return 0;
}

