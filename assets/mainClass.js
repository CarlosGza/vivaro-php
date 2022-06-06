
let services  = {
    users:{
        get: {route:'users',method:'get'},
        store: {route:'users',method:'post'},
        update: {route:'users/update',method:'post'},
    }
}

class mainClass {
    constructor() {
        this.showConsoleLogs = true;
        this.formats = {
            date: {
                long: 'dddd, DD [de] MMMM [de] YYYY',
                short: 'L'
            },
            datetimes: {
                long: 'dddd, DD [de] MMMM [de] YYYY hh:mm a',
                short: 'L HH:mm',
            },
            times: {
                long: 'hh:mm a',
                short: 'H:m'
            }
        }
    }

    logs(...log) {
        if (this.showConsoleLogs) {
            console.log(log);
        }
    }

    /**
     * @name  getAsync
     * @description Realiza una petición asíncrona
     * @version 1.0.0
     * @author Fernando Ferretiz - 
     * @param {string} obj.method - OPCIONAL - propiedad que indica el metodo a utilizar en la petición (POST|GET|PUT|DELETE|OPTIONS)
     * @param {string} obj.url  - REQUERIDO - propiedad que indica la url a donde se realizará la petición
     * @param {object,function} obj.headers  - OPCIONAL - indica las cabeceras que llevará la petición
     * @param {object,function,string} obj.data  - OPCIONAL - indica el juego de datos necesario para realizar la petición, el tipo puede ser funcion, objeto, o string
     * @param {object} obj.retry - OPCIONAL - objeto si este es definido indica que la peticion debe reintentarse cuando sea regresado un estado de respuesta en espeficico
     * @example
     *  getAsync({
     *      method:'POST',
     *      url :'',
     *      headers:()=>{
     *          return [
     *              ['Accept','json/application'],
     *          ]
     *          
     *      }
     *      data: ()=>{
     *          return {
     *          }
     *      },
     *      onSuccess:(response)=>{
     *      },
     *      onError:(response)=>{
     *      },
     *      onAbort:(response)=>{
     *      }
     *  })
     */
    getAsync(obj) {
        /** $this hace referencia a la propia instancia de la clase, 
         *      se establece de esta manera ya que el uso de 'this' 
         *      es relativo a la funcion donde se llama
         * */
        let $this = this;
        /**variable donde se almacenará los datos de la solicitud*/
        let _DATA_;
        /**Estados de respuesta http OK */
        let stts_ok = [200, 201];
        /**Metodos permitidos para la petición*/
        let methods = ['post', 'get', 'put', 'options', 'delete', 'patch'];
        let url     = null;
        let formData= new FormData();
        let urlQuery= '';
        
        /**
         * 
         */
        let retry = {
            times: 3, //Tres veces intenta
            sttsCodes: [400, 500, 503], //Internal Server Error
            delay: 1500, //1.5 segundos
            fnAfterRetry: (rs) => { $this.logs(rs); } //Se ejecuta si la petición se reintento y aun así falló
        };
        /**URL al ser un parametro requerido si no se encuentra definido 
         * realiza una validación, si este no se establece el proceso se detiene
         */
        if (typeof obj.url === 'undefined') {
            $this.logs('URL parameter is required');
            return false;
        }
        url = obj.url;
        /**
         * Si la propiedad method no está definida toma por defecto 'POST', 
         * de lo contrario tomará la que se haya especificado y hara una 
         * validación con los metodos permitidos, si falla esta se detiene 
         * el proceso y hace un log  */
        let method = typeof obj.method === 'undefined' ? 'post' : obj.method.toLowerCase();

        if(typeof obj.method !== 'undefined') _DATA_ = obj.data();

        if(['get', 'put','patch'].indexOf(method) >= 0){
            urlQuery = typeof _DATA_ =='string' ? '?'+_DATA_ : '?'+this.convertObjectToURL(_DATA_);
        }else{
            this.convertObjectToFormdata(formData, _DATA_);
        }
            

        if (methods.indexOf(method) === '-1') {
            $this.logs('method parameter is not valid');
            return false;
        }

        if(typeof obj.fnBefore !=='undefined'){
            obj.fnBefore();
        }


        var xhttp = new XMLHttpRequest();
            xhttp.open(method, url+urlQuery, true);
            xhttp.setRequestHeader('X-Requested-With','XMLHttpRequest');

        if (typeof obj.headers !== 'undefined') {

            obj.headers().forEach(header => {
                xhttp.setRequestHeader(header[0], header[1]);
            });
        }
        xhttp.setRequestHeader('Accept',  "application/json,text/*;q=0.99");

        xhttp.onload = function() {
            if (!stts_ok.indexOf(xhttp.status) && typeof xhttp.response.error !== 'undefined' ){

            }else{
                obj.onSuccess(JSON.parse(xhttp.response));
                
            }

        };

        xhttp.onprogress = function(event) {
            if (event.lengthComputable) {
                console.log(`Received ${event.loaded} of ${event.total} bytes`);
            } else {
                console.log(`Received ${event.loaded} bytes`); // no Content-Length
            }
        };

        xhttp.onerror = function() {
            console.log("Request failed");
        };

        xhttp.send(formData);

    }


    convertObjectToURL = (obj, prefix)=>{
        var str = [],
            p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                this.convertObjectToURL(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");

    }
    convertObjectToFormdata(formData, data, parentKey) {
        if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
          Object.keys(data).forEach(key => {
            this.convertObjectToFormdata(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
          });
        } else {
          const value = data == null ? '' : data;
      
          formData.append(parentKey, value);
        }
    }
    
    serialize(element,onError = ()=>{}){
        let inputsForm  = document.querySelectorAll(element+' input, '+element+' textarea, '+element+' select');
        let objForm     = {};
        let ok          = true;
       
        inputsForm.forEach(function(a,b){
            if(a.hasAttribute('name') && a.getAttribute('name') !== ''){
                let title = a.hasAttribute('title') ? a.getAttribute('title') : '';
                if(a.required){
                    if(!a.value){
                         onError({
                            title,
                            type: 'valueRequired',
                            infoInput:{
    
                            }
                        })
                        
                        ok = false;
                        
                    }else if(a.hasAttribute('min-length') && a.getAttribute('min-length') > a.value.length ){
                        ok = false;
                        onError({
                            title,
                            type: 'minLength',
                            infoInput:{
                                min:a.getAttribute('min-length')
                            }
                        })
                    
                    }else if(a.hasAttribute('max-length') && a.getAttribute('max-length') < a.value.length ){
                        ok = false;
                        onError({
                            title,
                            type: 'maxLength',
                            infoInput:{
                                max:a.getAttribute('max-length')
                            }
                        })
                    
                    }else{
                        objForm[a.name] = a.value;
                    }
                }else{
                    objForm[a.name] = a.value;
                }
            }
        })
        if(!ok){
            return false;
        }
        return objForm;

    }

    


    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return 'a'+result;
     }
   
}

