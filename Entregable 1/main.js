"use strict"
document.addEventListener("DOMContentLoaded", function(){

    let canvas = document.querySelector('.canvas1');
    let input = document.querySelector('.input1');
    let context = canvas.getContext('2d');
    let imageData = context.createImageData(canvas.width, canvas.height);
    let color;

    context.fillStyle = "#F0F0EC"; // canvas background color
    context.fillRect(0, 0, canvas.width, canvas.height);

    //SLIDER PINCEL
    let tamanioPincel = document.querySelector("#tamanioPincel");
    let sliderValor = document.querySelector("#slider");
    tamanioPincel.addEventListener("input", slider);
    function slider(){ //ANDA
        sliderValor.innerHTML = tamanioPincel.value;
        return tamanioPincel.value;
    };
    let herramienta = document.querySelector("#herramientaDibujo");
    herramienta.addEventListener("change", accionDibujo);
    function accionDibujo(){ // DIBUJO/BORRAR
        let prevX = 0;
        let currX = 0;
        let prevY = 0;
        let currY = 0;
        let dot_flag = false;
        let flag = false;        
        if(herramienta.value == "lapiz"){
            color = "#000000"
        }else{ 
            color = "#ffffff"};
        canvas.addEventListener("mousemove", function (e) {
            encontrarXy('move', e, color)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            encontrarXy('down', e, color)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            encontrarXy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            encontrarXy('out', e)
        }, false);
        function encontrarXy(res, e, color) {
            if (res == 'down') {
                prevX = currX;
                prevY = currY;
                currX = e.pageX - canvas.offsetLeft;
                currY = e.pageY - canvas.offsetTop;
                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    context.beginPath();
                    context.arc(currX, currY, 7.5, Math.PI*2, false);
                    context.lineWidth = slider();
                    context.strokeStyle = color;
                    context.stroke();
                    context.closePath();
                    dot_flag = false;
                }
            }
            if (res == 'up' || res == "out") {
                flag = false;
            }
            if (res == 'move') {
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = e.pageX - canvas.offsetLeft;
                    currY = e.pageY - canvas.offsetTop;
                    draw(color);
                }
            }
        }
        function draw(color) {       
            context.beginPath();
            context.arc(currX, currY, 7.5, Math.PI*2, false);
            context.lineWidth = slider();
            context.strokeStyle = color;
            context.stroke();
            context.closePath();
        }
    }//FIN FUNCION DIBUJO/BORRAR

    //Cargando imagen local al iniciar
    let image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = 'unaFoto.jpg';
    image.onload = function () {
        context.fillStyle = "#F0F0EC"; // canvas background color
        let imageAspectRatio = (1.0 * this.height) / this.width;
        let imageScaledWidth = canvas.width;
        let imageScaledHeight = canvas.width * imageAspectRatio;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // draw image on canvas
        context.drawImage(this, 0, 0, imageScaledWidth, imageScaledHeight);
        // get imageData from content of canvas
        let imageData = context.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
        // draw the modified image
        context.putImageData(imageData, 0, 0);
        }

    //Cargar imagen adaptable
    input.onchange = e => {
        // getting a hold of the file reference
        let file = e.target.files[0];
        // setting up the reader
        let reader = new FileReader();
        reader.readAsDataURL(file); // this is reading as data url
        reader.onload = readerEvent => {// here we tell the reader what to do when it's done reading...
            let content = readerEvent.target.result; // this is the content!
            let image = new Image();
            image.src = content;
            image.onload = function () {
                let imageAspectRatio = (1.0 * this.height) / this.width;
                let imageScaledWidth = canvas.width;
                let imageScaledHeight = canvas.width * imageAspectRatio;
                context.canvas.width = imageScaledWidth;
                context.canvas.height = imageScaledHeight;
                context.drawImage(this, 0, 0, imageScaledWidth, imageScaledHeight);
                let imageData = context.getImageData(0, 0, imageScaledWidth, imageScaledHeight);// get imageData from content of canvas
                context.putImageData(imageData, 0, 0);
            }
        }
    }
    //LIENZO EN BLANCO
    let btnNuevoLienzo = document.querySelector('#nuevoLienzo');
    btnNuevoLienzo.addEventListener("click", canvasEnBlanco);
    function canvasEnBlanco(){
        context.fillStyle = "#F0F0EC"; // canvas background color
        context.fillRect(0, 0, canvas.width, canvas.height);    
    }
    //DESCARGAR
    let descargar = document.querySelector("#descargar")
    descargar.addEventListener("click", download);
    function download(){
        descargar.href = canvas.toDataURL();
        descargar.download = "miImagen.jpg";
    }
    // FILTROS BASICOS
    let filtro = document.querySelector("#exampleFormControlSelect1");
    filtro.addEventListener("change", function(){
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let image = imageData;
        let data = imageData.data;
        // NEGATIVO
        if(filtro.value == "negativo"){
            for(let x = 0; x < data.length; x += 4){
                data[x + 0] = 255 - getRed(x);
                data[x + 1] = 255 - getGreen(x);
                data[x + 2] = 255 - getBlue(x);
            }
        context.putImageData(image, 0, 0);
        }
        // BINARIZACION
        if(filtro.value == "binarizacion"){
            let umbral = 50
            for(let x = 0; x < data.length; x += 4){
                let promedio = Math.floor((getRed(x)+getGreen(x)+getBlue(x))/3)
                if(promedio > umbral){
                    data[x + 0] = 255 ;
                    data[x + 1] = 255 ;
                    data[x + 2] = 255 ;
                }else{
                    data[x + 0] = 0 ;
                    data[x + 1] = 0 ;
                    data[x + 2] = 0 ;
                }
            }
            context.putImageData(image, 0, 0);
        }
        // SEPIA    
        if(filtro.value == "sepia"){
            for(let x = 0; x < data.length; x += 4){
                let promedio = Math.floor((getRed(x)+getGreen(x)+getBlue(x))/3)
                data[x+0]= Math.min(promedio + 40, 255)
                data[x+1]= Math.min(promedio + 15, 255)
                data[x+2]= Math.min(promedio ,255)   
            }
        context.putImageData(image, 0, 0);
        }
        // ESCALA DE GRISES    
        if(filtro.value == "escalaGrises"){
            for(let x = 0; x < data.length; x += 4){
                let gris = Math.floor((getGreen(x) + getRed(x) + getBlue(x))/3);
                data[x + 0] = gris;
                data[x + 1] = gris;
                data[x + 2] = gris;
            }
        context.putImageData(image, 0, 0);
        }
        let kernel;
        if(filtro.value == "blur"){
            kernel = [1/19,1/19,1/19,1/19,1/19,1/19,1/19,1/19,1/19];//blur
            convolucion(kernel);
        }
        if(filtro.value == "nitidez"){
            kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];//Nitidez
            convolucion(kernel);
        }    
        if(filtro.value == "deteccionDeBorde"){
            kernel = [1, 1, 1, 1, -7, 1, 1, 1, 1]//deteccion de borde
            convolucion(kernel);
        }
        function getRed(x){ 
            return imageData.data[x];
        }
        function getGreen(x){
            return imageData.data[x + 1];
        }
        function getBlue(x){  
            return imageData.data[x + 2];
        }
        //FIN FILTROS BASICOS
    });
    //FILTROS AVANZADOS
    function convolucion(kernel) {
        let size = Math.sqrt(kernel.length);
        let half = Math.floor(size / 2);
        let width = canvas.width;
        let height = canvas.height;
        let inputData = context.getImageData(0, 0, width, height).data;
        let outputData = imageData.data;
        let pixelsAbove;
        let weight;
        let neighborY;
        let neighborX;
        let inputIndex;
        let outputIndex;
        for (let i = 0; i < height; ++i) {
            pixelsAbove = i * width;
            for (let j = 0; j < width; ++j) {
                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;
                for (let kernelY = 0; kernelY < size; ++kernelY) {
                    for (let kernelX = 0; kernelX < size; ++kernelX) {
                        weight = kernel[kernelY * size + kernelX];
                        neighborY = Math.min(
                            height - 1,
                            Math.max(0, i + kernelY - half)
                        );
                        neighborX = Math.min(
                            width - 1,
                            Math.max(0, j + kernelX - half)
                        );
                        inputIndex = (neighborY * width + neighborX) * 4;
                        r += inputData[inputIndex] * weight;
                        g += inputData[inputIndex + 1] * weight;
                        b += inputData[inputIndex + 2] * weight;
                        a += inputData[inputIndex + 3] * weight;
                    }
                }
                outputIndex = (pixelsAbove + j) * 4;
                outputData[outputIndex] = r;
                outputData[outputIndex + 1] = g;
                outputData[outputIndex + 2] = b;
                outputData[outputIndex + 3] = kernel.normalized ? a : 255;
            }
        }
        context.putImageData(imageData, 0, 0);
    }
});