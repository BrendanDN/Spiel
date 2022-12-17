let Auth;

function signout() {
  try {
    user.leave();
    location.reload();
  } catch(err) {
    alert(err);
  }
}

class Head extends HTMLElement {
  constructor() {
    super();

    if (user.is) {
       Auth = `
        <ul>
          <li><button onclick="signout()">Sign Out</button></li>
        </ul>
      `;
    } else {
      Auth = `
        <ul>
          <li><button onclick="window.location.href = 'auth.html?auth=signin'">Sign In</button></li>
          <li><button onclick="window.location.href = 'auth.html?auth=signup'">Sign Up</button></li>
        </ul>
      `;
    }
    
    this.innerHTML = `
      <header>
        <div class="center">
          <h1>Spiel</h1>
        </div>
        <div class="center">
          <nav>
            <ul>
              <li><button onclick="window.location.href = '/'">Home</button></li>
              <li><button onclick="window.location.href = 'studio.html'">Live</button></li>
              <li><button onclick="window.location.href = 'https://github.com/BrendanDN/Spiel#guides'">Guides</button></li>
              <li><button onclick="window.location.href = 'https://github.com/BrendanDN/Spiel#support'">Support</button></li>
            </ul>
            <hr>
            ` + Auth + `
          </nav>
        </div>
      </header>
    `;
  }
}

class Foot extends HTMLElement {
  constructor() {
    super();
    
    this.innerHTML = `
      <footer>
        <pre><b>Spiel</b></pre>
        <button onclick="window.location.href = 'https://github.com/BrendanDN/Spiel#support-us'">Donate</button> 
      </footer>
    `;
  }
}
    
window.customElements.define('h-d', Head);
window.customElements.define('f-t', Foot);
