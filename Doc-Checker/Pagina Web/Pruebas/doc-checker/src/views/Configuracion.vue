<template>
    <div class="Configuracion">
        <img src="@/assets/doc.png" height="100" width="100" />
        <form action="/my-handling-form-page" method="post">
        <h2>Cambiar contraseña</h2>
            <ul>
            <li>
                <label for="mail">Escribe tu contraseña actual:</label>
                <input type="email" id="mail" name="user_mail">
            </li>
            <li>
                <label for="name">Escribe tu nueva contraseña:</label>
                <input type="text" id="password" name="user_password">
            </li>
            <li>
                <label for="name">Vuelve a escribir tu nueva constraseña:</label>
                <input type="text" id="name" name="user_name">
            </li>
            <router-link to="/configuracion">
                <input type="submit" class="fadeIn fourth" value="Restablecer">
            </router-link>
            </ul>
            <h2>Información</h2>
            <ul>
            <li>
                <label for="name">Ayuda</label>
            </li>
            <li>
                <label for="name">Privacidad</label>
            </li>
            <li>
                <label for="name">Terminos del servicio</label>
            </li>
            <router-link to="/">
                <input type="submit" class="fadeIn fourth" value="Cerrar sesión">
            </router-link>
            </ul>
        </form>
    </div>    
</template>

<script>
export default {
    name: 'Configuracion',
    setup() {

    }
}
</script>