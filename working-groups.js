'use strict'

require('extensions')
var GET = require('get-then')
var wgs = require('./data/working-groups.json')

var readmeParsers = {
  'Technical Steering Committee': readme => /### Current Members[^#]+##/i.exec(readme)[0],
  'Core Technical Committee': readme => /### CTC \(Core Technical Committee\)[^#]+##/i.exec(readme)[0],

  'Inclusivity': readme => /### Members[^#]+## /i.exec(readme)[0],

  'Addon API': readme => /### WG Members \/ Collaborators[^#]+## Licence/i.exec(readme)[0],
  'Benchmarking': readme => /## Current Project Team Members[^$]+/i.exec(readme)[0],
  'Build': readme => /People\n------[^$]+/i.exec(readme)[0],
  'Docker': readme => /## Docker Working Group Members[^#]+##/i.exec(readme)[0],
  'Documentation': readme => /## Current Documentation WG Members[^$]+/i.exec(readme)[0],
  'Evangelism': readme => /### Evangelism WG Members[^$]+/i.exec(readme)[0],
  // 'HTTP': '', doesn't have a members section at this time
  'Intl': readme => /## Current WG Members[^$]+/i.exec(readme)[0],
  'Post Mortem': readme => /members of the working group include:[^$]+/i.exec(readme)[0],
  'Roadmap': readme => /Current WG Members:[^$]+/i.exec(readme)[0],
  'Streams': readme => /# Streams WG Team Members[^$]+/i.exec(readme)[0],
  'Testing': readme => /## Current Project Team Members:[^$]+/i.exec(readme)[0],
  'Tracing': readme => /### Members[^$]+/i.exec(readme)[0],
  'Website': readme => /### Website Working Group Collaborators[^$]+/i.exec(readme)[0],

  'Help': readme => /## Help WG Members[^$]+/i.exec(readme)[0],
  'Promises': readme => /Working Group Members[^$]+/i.exec(readme)[0]
  // 'LTS': '', doesn't have a members section at this time
  // 'Hardware': '', doesn't have a members section at this time
  // 'Collaboration': '', doesn't have a members section at this time
  // 'API': '', doesn't have a members section at this time
}
var parseMentions = section => section.match(/(^|\W)[@|＠]([a-z0-9-]{1,39})(\b|$)/ig).map(x => x.substr(2).toLowerCase())
var parseGithubURL = section => section.match(/(?:github.com\/)([a-z0-9-]{1,39})(\b|$)/ig).map(x => x.substr(11).toLowerCase())
var nameParsers = {
  'Technical Steering Committee': parseMentions,
  'Core Technical Committee': parseGithubURL,

  'Inclusivity': parseMentions,

  'Addon API': parseGithubURL,
  'Benchmarking': parseMentions,
  'Build': parseGithubURL,
  'Docker': parseGithubURL,
  'Documentation': parseMentions,
  'Evangelism': parseGithubURL,
  // 'HTTP': '', doesn't have a members section at this time
  'Intl': parseMentions,
  'Post Mortem': parseMentions,
  'Roadmap': parseMentions,
  'Streams': parseGithubURL,
  'Testing': parseGithubURL,
  'Tracing': parseMentions,
  'Website': parseGithubURL,

  'Help': parseGithubURL,
  'Promises': parseMentions
  // 'LTS': '', doesn't have a members section at this time
  // 'Hardware': '', doesn't have a members section at this time
  // 'Collaboration': '', doesn't have a members section at this time
  // 'API': '', doesn't have a members section at this time
}
const dedupe = arr => Array.from(new Set(arr))

Promise.all(
  Object.keys(wgs).map(type =>
    Promise.all(
      wgs[type].$map((value, key) =>
        /i18n|HTTP|LTS|Hardware|Collaboration|API/.test(key) ? Promise.resolve(null)

        : GET(`https://raw.githubusercontent.com/nodejs/${value.repo}/master/README.md`)
          .then(String)
          .then(readmeParsers[key])
          .then(nameParsers[key])
          .then((names) =>
            (wgs[type][key].members = dedupe(names).sort())
          )
          .catch(e => {
            e.message = `Failed to download/parse readme for ${key}\n` + e.message
            return Promise.reject(e)
          })
      )
    )
  )
)
.then(results => {
  // results.forEach()
  console.log(wgs.$json2)
})
.catch(console.log)



// Promise.resolve(
// `
//
// The Node.js project team comprises a group of core collaborators and a sub-group
// that forms the _Core Technical Committee_ (CTC) which governs the project. For more
// information about the governance of the Node.js project, see
// [GOVERNANCE.md](./GOVERNANCE.md).
//
// ### CTC (Core Technical Committee)
//
// * [bnoordhuis](https://github.com/bnoordhuis) - **Ben Noordhuis** &lt;info@bnoordhuis.nl&gt;
// * [ChALkeR](https://github.com/ChALkeR) - **Сковорода Никита Андреевич** &lt;chalkerx@gmail.com&gt;
// * [chrisdickinson](https://github.com/chrisdickinson) - **Chris Dickinson** &lt;christopher.s.dickinson@gmail.com&gt;
// * [cjihrig](https://github.com/cjihrig) - **Colin Ihrig** &lt;cjihrig@gmail.com&gt;
// * [evanlucas](https://github.com/evanlucas) - **Evan Lucas** &lt;evanlucas@me.com&gt;
// * [fishrock123](https://github.com/fishrock123) - **Jeremiah Senkpiel** &lt;fishrock123@rocketmail.com&gt;
// * [indutny](https://github.com/indutny) - **Fedor Indutny** &lt;fedor.indutny@gmail.com&gt;
// * [jasnell](https://github.com/jasnell) - **James M Snell** &lt;jasnell@gmail.com&gt;
// * [mhdawson](https://github.com/mhdawson) - **Michael Dawson** &lt;michael_dawson@ca.ibm.com&gt;
// * [misterdjules](https://github.com/misterdjules) - **Julien Gilli** &lt;jgilli@nodejs.org&gt;
// * [mscdex](https://github.com/mscdex) - **Brian White** &lt;mscdex@mscdex.net&gt;
// * [ofrobots](https://github.com/ofrobots) - **Ali Ijaz Sheikh** &lt;ofrobots@google.com&gt;
// * [orangemocha](https://github.com/orangemocha) - **Alexis Campailla** &lt;orangemocha@nodejs.org&gt;
// * [piscisaureus](https://github.com/piscisaureus) - **Bert Belder** &lt;bertbelder@gmail.com&gt;
// * [rvagg](https://github.com/rvagg) - **Rod Vagg** &lt;rod@vagg.org&gt;
// * [shigeki](https://github.com/shigeki) - **Shigeki Ohtsu** &lt;ohtsu@iij.ad.jp&gt;
// * [trevnorris](https://github.com/trevnorris) - **Trevor Norris** &lt;trev.norris@gmail.com&gt;
// * [Trott](https://github.com/Trott) - **Rich Trott** &lt;rtrott@gmail.com&gt;
//
// ### Collaborators
//
// * [addaleax](https://github.com/addaleax) - **Anna Henningsen** &lt;anna@addaleax.net&gt;
// * [AndreasMadsen](https://github.com/AndreasMadsen) - **Andreas Madsen** &lt;amwebdk@gmail.com&gt;
// * [bengl](https://github.com/bengl) - **Bryan English** &lt;bryan@bryanenglish.com&gt;
// * [benjamingr](https://github.com/benjamingr) - **Benjamin Gruenbaum** &lt;benjamingr@gmail.com&gt;
// * [bmeck](https://github.com/bmeck) - **Bradley Farias** &lt;bradley.meck@gmail.com&gt;
// * [brendanashworth](https://github.com/brendanashworth) - **Brendan Ashworth** &lt;brendan.ashworth@me.com&gt;
// * [calvinmetcalf](https://github.com/calvinmetcalf) - **Calvin Metcalf** &lt;calvin.metcalf@gmail.com&gt;
// * [claudiorodriguez](https://github.com/claudiorodriguez) - **Claudio Rodriguez** &lt;cjrodr@yahoo.com&gt;
// * [domenic](https://github.com/domenic) - **Domenic Denicola** &lt;d@domenic.me&gt;
// * [eljefedelrodeodeljefe](https://github.com/eljefedelrodeodeljefe) - **Robert Jefe Lindstaedt** &lt;robert.lindstaedt@gmail.com&gt;
// * [estliberitas](https://github.com/estliberitas) - **Alexander Makarenko** &lt;estliberitas@gmail.com&gt;
// * [firedfox](https://github.com/firedfox) - **Daniel Wang** &lt;wangyang0123@gmail.com&gt;
// * [geek](https://github.com/geek) - **Wyatt Preul** &lt;wpreul@gmail.com&gt;
// * [iarna](https://github.com/iarna) - **Rebecca Turner** &lt;me@re-becca.org&gt;
// * [isaacs](https://github.com/isaacs) - **Isaac Z. Schlueter** &lt;i@izs.me&gt;
// * [iWuzHere](https://github.com/iWuzHere) - **Imran Iqbal** &lt;imran@imraniqbal.org&gt;
// * [JacksonTian](https://github.com/JacksonTian) - **Jackson Tian** &lt;shvyo1987@gmail.com&gt;
// * [jbergstroem](https://github.com/jbergstroem) - **Johan Bergström** &lt;bugs@bergstroem.nu&gt;
// * [jhamhader](https://github.com/jhamhader) - **Yuval Brik** &lt;yuval@brik.org.il&gt;
// * [joaocgreis](https://github.com/joaocgreis) - **João Reis** &lt;reis@janeasystems.com&gt;
// * [julianduque](https://github.com/julianduque) - **Julian Duque** &lt;julianduquej@gmail.com&gt;
// * [JungMinu](https://github.com/JungMinu) - **Minwoo Jung** &lt;jmwsoft@gmail.com&gt;
// * [lxe](https://github.com/lxe) - **Aleksey Smolenchuk** &lt;lxe@lxe.co&gt;
// * [matthewloring](https://github.com/matthewloring) - **Matthew Loring** &lt;mattloring@google.com&gt;
// * [mcollina](https://github.com/mcollina) - **Matteo Collina** &lt;matteo.collina@gmail.com&gt;
// * [micnic](https://github.com/micnic) - **Nicu Micleușanu** &lt;micnic90@gmail.com&gt;
// * [mikeal](https://github.com/mikeal) - **Mikeal Rogers** &lt;mikeal.rogers@gmail.com&gt;
// * [monsanto](https://github.com/monsanto) - **Christopher Monsanto** &lt;chris@monsan.to&gt;
// * [Olegas](https://github.com/Olegas) - **Oleg Elifantiev** &lt;oleg@elifantiev.ru&gt;
// * [othiym23](https://github.com/othiym23) - **Forrest L Norvell** &lt;ogd@aoaioxxysz.net&gt;
// * [petkaantonov](https://github.com/petkaantonov) - **Petka Antonov** &lt;petka_antonov@hotmail.com&gt;
// * [phillipj](https://github.com/phillipj) - **Phillip Johnsen** &lt;johphi@gmail.com&gt;
// * [pmq20](https://github.com/pmq20) - **Minqi Pan** &lt;pmq2001@gmail.com&gt;
// * [qard](https://github.com/qard) - **Stephen Belanger** &lt;admin@stephenbelanger.com&gt;
// * [rlidwka](https://github.com/rlidwka) - **Alex Kocharin** &lt;alex@kocharin.ru&gt;
// * [rmg](https://github.com/rmg) - **Ryan Graham** &lt;r.m.graham@gmail.com&gt;
// * [robertkowalski](https://github.com/robertkowalski) - **Robert Kowalski** &lt;rok@kowalski.gd&gt;
// * [romankl](https://github.com/romankl) - **Roman Klauke** &lt;romaaan.git@gmail.com&gt;
// * [ronkorving](https://github.com/ronkorving) - **Ron Korving** &lt;ron@ronkorving.nl&gt;
// * [RReverser](https://github.com/RReverser) - **Ingvar Stepanyan** &lt;me@rreverser.com&gt;
// * [saghul](https://github.com/saghul) - **Saúl Ibarra Corretgé** &lt;saghul@gmail.com&gt;
// * [sam-github](https://github.com/sam-github) - **Sam Roberts** &lt;vieuxtech@gmail.com&gt;
// * [santigimeno](https://github.com/santigimeno) - **Santiago Gimeno** &lt;santiago.gimeno@gmail.com&gt;
// * [seishun](https://github.com/seishun) - **Nikolai Vavilov** &lt;vvnicholas@gmail.com&gt;
// * [silverwind](https://github.com/silverwind) - **Roman Reiss** &lt;me@silverwind.io&gt;
// * [srl295](https://github.com/srl295) - **Steven R Loomis** &lt;srloomis@us.ibm.com&gt;
// * [stefanmb](https://github.com/stefanmb) - **Stefan Budeanu** &lt;stefan@budeanu.com&gt;
// * [targos](https://github.com/targos) - **Michaël Zasso** &lt;mic.besace@gmail.com&gt;
// * [tellnes](https://github.com/tellnes) - **Christian Tellnes** &lt;christian@tellnes.no&gt;
// * [thealphanerd](https://github.com/thealphanerd) - **Myles Borins** &lt;myles.borins@gmail.com&gt;
// * [thefourtheye](https://github.com/thefourtheye) - **Sakthipriyan Vairamani** &lt;thechargingvolcano@gmail.com&gt;
// * [thekemkid](https://github.com/thekemkid) - **Glen Keane** &lt;glenkeane.94@gmail.com&gt;
// * [thlorenz](https://github.com/thlorenz) - **Thorsten Lorenz** &lt;thlorenz@gmx.de&gt;
// * [tunniclm](https://github.com/tunniclm) - **Mike Tunnicliffe** &lt;m.j.tunnicliffe@gmail.com&gt;
// * [vkurchatkin](https://github.com/vkurchatkin) - **Vladimir Kurchatkin** &lt;vladimir.kurchatkin@gmail.com&gt;
// * [whitlockjc](https://github.com/whitlockjc) - **Jeremy Whitlock** &lt;jwhitlock@apache.org&gt;
// * [yorkie](https://github.com/yorkie) - **Yorkie Liu** &lt;yorkiefixer@gmail.com&gt;
// * [yosuke-furukawa](https://github.com/yosuke-furukawa) - **Yosuke Furukawa** &lt;yosuke.furukawa@gmail.com&gt;
// * [zkat](https://github.com/zkat) - **Kat Marchán** &lt;kzm@sykosomatic.org&gt;
//
// Collaborators & CTC members follow the [COLLABORATOR_GUIDE.md](./COLLABORATOR_GUIDE.md) in
// maintaining the Node.js project.
//
// ### Release Team
//
// Releases of Node.js and io.js will be signed with one of the following GPG keys:
//
// * **Chris Dickinson** &lt;christopher.s.dickinson@gmail.com
// * **Colin Ihrig** &lt;cjihrig@gmail.com
// * **Evan Lucas** &lt;evanlucas@me.com
// * **James M Snell** &lt;jasnell@keybase.io
// * **Jeremiah Senkpiel** &lt;fishrock@keybase.io
// * **Myles Borins** &lt;myles.borins@gmail.com
// * **Rod Vagg** &lt;rod@vagg.org
// * **Sam Roberts** &lt;octetcloud@keybase.io
//
//  `
// )
// // .then(parseGithubURL)
// // .then(name_parsers['Streams'])
// .then(readmeParsers['Core Technical Committee'])
// // .then(nameParsers['Core Technical Committee'])
// .then(console.log)
// .catch(console.log)








