import HealthBar from '../UI_Parts/HealthBar.js';
import RageEureka from '../UI_Parts/EurekaRageBar.js';
import Stats from '../UI_Dicotomy_Parts/Stats.js';
import Dial from '../UI_Parts/DicotomyDial.js';
//Va a ser necesario organizar la ui con containers para la dicotomía que la oculta para
//que sea mas sencillo de hacer

export default class UI extends Phaser.Scene    
{
   
    constructor() {
        super({ key: 'UIScene'});

    }
    //data transfer
    init() {

    }
    preload () {

    }
    create() {
        this.mainScene = this.scene.get('level');
        this.player = this.mainScene.player;

        //parres voy a bombardear la vaguada a ver si asi orientas a objetros cabron
        //zona barra de vida
        this.GRP_BarraVida = new HealthBar(this,100,900);

        // Creación de la barra de furiaEureka
        this.GRP_FuriaEureka = new RageEureka(this,330,1000);

        // Creación estadísticas
        this.GRP_Estadisticas = new Stats(this, this.sys.game.canvas.width -35, this.sys.game.canvas.height / 2 + 100).setScale(1);
        
        //texto de crono
        this.GRP_Reloj = this.add.group();
        this.marcoReloj = this.add.image(960, 50, 'marcoReloj').setOrigin(0.5, 0.5).setScale(1.5,1.5);
        this.timeText = this.add.text(this.marcoReloj.x, this.marcoReloj.y + 4,' ',{ font: '60px JosefinMedium', fill: 'white' }).setOrigin(0.5, 0.5);
        this.secondsCount = 0;
        this.minuteCount = 0;
        this.GRP_Reloj.addMultiple([this.marcoReloj, this.timeText]);
        
        
        //datos de la oleada (por rellenar y gestionar actualizacion)
        this.GRP_DatosOleada = this.add.group();
        this.waveData = this.add.image(150, 190, 'waveInfo').setOrigin(0.5, 0.5).setScale(1, 1);
        this.waveN = this.add.text(this.waveData.x, this.waveData.y - 78,'xxxx',{ font: '40px JosefinMedium', fill: '#424242'}).setOrigin(0.5, 0.5);
        this.enemiesN = this.add.text(this.waveData.x, this.waveData.y + 35,'123',{ font: '33px JosefinMedium', fill: '#424242' }).setOrigin(0.5, 0.5);
        this.GRP_DatosOleada.addMultiple([this.waveData, this.waveN, this.enemiesN]);
        
        
        //indicador de tiempo para la siguiente oleada
        this.GRP_NextWave = this.add.group();
        this.nextWaveIMG = this.add.image(150, 450, 'nextWave').setOrigin(0.5, 0.5).setScale(1, 1);
        this.nextWave = this.add.text(this.nextWaveIMG.x, this.nextWaveIMG.y + 24,'xxxx',{ font: '35px JosefinMedium', fill: 'white' }).setOrigin(0.5, 0.5);    
        this.GRP_NextWave.addMultiple([this.nextWaveIMG, this.nextWave]);
        
        
        // Creación indicador dust
        this.GRP_Dust = this.add.group();
        this.dust = this.add.text(1730, 1000,'xxxx', { font: '50px JosefinMedium', fill: 'white', align: 'right', stroke: 'black', strokeThickness: 5}).setOrigin(1,0.5);
        this.dustIMG = this.add.image(1860 , 1000, 'polvos').setScale(0.1).setOrigin(1,0.5);
        this.GRP_Dust.addMultiple([this.dust, this.dustIMG]);
        
        // Creación del mapa
        this.map = this.add.image(1730, 180, 'map').setOrigin(0.5, 0.5).setScale(0.6, 0.6);
        
        // Creación de las dicotomías
        this.GRP_Dicotomias = this.add.group();

        this.GRP_Dicotomias.add(this.add.image(1100, 929, 'fondoDicotomias').setOrigin(0.5, 0.5));

        this.dial1 = new Dial(this, 800, 950, 1);
        this.dial2 = new Dial(this, 1000, 950, 2);
        this.dial3 = new Dial(this, 1200, 950, 3);
        this.dial4 = new Dial(this, 1400, 950, 4);
        
        this.GRP_Dicotomias.addMultiple([this.dial1,this.dial2,this.dial3,this.dial4]);
        
        //this.GRP_Dicotomias.add(this.add.image(1400, 950, 'marcoDialFrame').setOrigin(0.5, 0.5));
        
        // Imagenes efectos rage/eureka
        this.rageEffect = this.add.image(0, 0, 'bloodEffect').setOrigin(0,0).setDisplaySize(1920, 1080).setAlpha(0.3);
        this.eurekaEffect = this.add.image(0, 0, 'freezeEffect').setOrigin(0,0).setDisplaySize(1920, 1080).setAlpha(0.6);

        this.mainScene.dicotomyManager.AplieDicotomy(3);
        this.updateDicotomias();
    }
    update(t,dt) {
        
        this.updateWaveData();
        const ourGame = this.scene.get('level');
        //console.log("UI created");


        if (ourGame.player != undefined) {

            this.GRP_BarraVida.setValues(ourGame.player.health, ourGame.player.maxLife);

            this.rageEffect.setVisible(ourGame.player.rageMode)          
            this.eurekaEffect.setVisible(ourGame.player.eurekaMode)

            if(ourGame.player.rageMode){
                this.GRP_FuriaEureka.setRage((ourGame.player.dicTotalTime - ourGame.player.dicTime), ourGame.player.dicTotalTime)
            }else if(ourGame.player.eurekaMode){
                this.GRP_FuriaEureka.setEureka((ourGame.player.dicTotalTime - ourGame.player.dicTime), ourGame.player.dicTotalTime);
            }else{
                this.GRP_FuriaEureka.setRage(ourGame.player.rage, ourGame.player.rageMax)
                this.GRP_FuriaEureka.setEureka(ourGame.player._eureka, ourGame.player.eurekaMax)
            }
        }

        this.timerUpdate(dt);
        //se puede llamar en el momento en el que se entra en rabia o mediante un callback
        this.GRP_Estadisticas.updateStats(this.player);
        
        this.dust.setText(this.player.dust);
    }

    /**
     * actualiza el temporizador de tiempo general de juego
     * @param {number} dt delta time de la escena 
     */
    timerUpdate(dt){
        //set timer UI
		this.secondsCount += dt/1000;
		if(this.secondsCount >= 60){
            this.minuteCount++;
			this.secondsCount = 0;
		}	
        this.timeText.setText ((this.secondsCount <59.5 ? this.minuteCount : this.minuteCount+1).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
          })+ ':' +(this.secondsCount <59.5 ? this.secondsCount : 0).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
            maximumFractionDigits:0 
          })) ;
    }

    //update de la info de oleadas, revisar pls
    updateWaveData() {

        //actualizar el numero de oleada
        this.waveN.setText(this.mainScene.wavesProbe.currentWave+1);
        
        //actualizar el timer de la proxima oleada
        this.nextWave.setText(Math.floor(this.mainScene.wavesProbe.nextWaveStartTime() / 60).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
            maximumFractionDigits:0
        })+ ':' +(this.mainScene.wavesProbe.nextWaveStartTime() % 60).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
            maximumFractionDigits:0 
        })) ;
        
        //samuel puto sinverguenza paga el polen y calcula las cosas fuera de la UI borracho putero estafador
        //calculo de los enemigos de esta oleada
        let nEnemies = 0;
        for(let i = 0; i< this.mainScene.waveJson.Waves[this.mainScene.wavesProbe.waveType].spawnsData.length;i++){
            nEnemies += this.mainScene.waveJson.Waves[this.mainScene.wavesProbe.waveType].spawnsData[i].size;
        }

        this.enemiesN.setText(nEnemies);

    }

    updateDicotomias(){
        this.dial1.updateDial();
        this.dial2.updateDial();
        this.dial3.updateDial();
        this.dial4.updateDial();
    } 
}