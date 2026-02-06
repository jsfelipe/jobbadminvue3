import { ElNotification } from 'element-plus';
import '@/assets/notifications.css'; 

export default {
  install(app) {
    // Definindo a função global para exibir notificações
    app.config.globalProperties.$alerta = function (mensagem, tipo = 'success', timeout = 3000) { 
      ElNotification({
        title:mensagem,
        message: '',
        type: tipo, // Tipo de notificação (success, error, info, warning)
        duration: timeout, // Tempo de duração
        customClass: `custom-notification ${tipo}`
      });
    };
  }
};
