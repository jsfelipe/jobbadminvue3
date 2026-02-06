import Vue from "vue";

export default {
 'List': (id) => {     
    return new Promise((resolve, reject) => {
      Vue.prototype.$http.get(`${process.env.VUE_APP_API_V2}/users?id_orcamento=${id}`,)
         .then(resp => {             
              resolve(resp.data)                
         }).catch(error => {
               reject(error)
         })
     })
 },
}