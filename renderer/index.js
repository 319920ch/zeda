document.getElementById("btnCargar").addEventListener("click", async () => {
  const users = await window.api.getUsers();
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u.nombre;
    lista.appendChild(li);
  });
});
