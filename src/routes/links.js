const express = require("express");
const router = express.Router();
//const alert = require("alert");
const notifier = require('node-notifier');

const pool = require("../database");
const {isLoggedIn} = require('../lib/auth');

router.get("/add", isLoggedIn, (req, res) => {
  res.render("links/add");
});

router.post("/add", isLoggedIn, async (req, res) => {
  const { title, url, description } = req.body;
  const newLink = {
    title,
    url,
    description,
    user_id: req.user.id
  };
  await pool.query("INSERT INTO links set ?", [newLink]);
  //res.send('Received');
  //req.flash('success','Link saved successfully');
  //alert("Link saved successfully");
  //notifier.notify('Link saved successfully');
  notifier.notify({
    title: [newLink.title],
    message: 'Link saved successfully!'
  });
  res.redirect("/links");

  //OPTION 2
  /* const {valor,cuenta,concepto} = req.body;
  const newLink= {
    valor,
    cuenta,
    concepto
  };
  await pool.query('INSERT INTO gastos set ?',[newLink]);
  //console.log(newLink)
  res.send('Received'); */
});

router.get("/", isLoggedIn, async (req, res) => {
  const links = await pool.query("SELECT * FROM links WHERE user_id =?", [req.user.id]);
  //console.log(links);
  //res.send('Received list of links');
  res.render("links/list", { links });
});

router.get("/delete/:id", isLoggedIn, async (req, res) => {
  //console.log(req.params.id);
  //res.send("LINK DELETED");
  const { id } = req.params;
  await pool.query("DELETE FROM links WHERE ID = ?", [id]);
  //req.flash('success','Link remove successfully');
  //alert('Link deleted successfully');
  notifier.notify({
    title: 'Id: ' + [id],
    message: 'Link deleted successfully!'
  });
  res.redirect("/links");
});

router.get("/edit/:id", isLoggedIn, async (req, res) => {
  //console.log(req.params.id);
  //res.send("edit");
  //res.redirect('/links');
  const { id } = req.params;
  const links = await pool.query("SELECT * FROM links WHERE ID = ?", [id]);
  //console.log(links[0]);
  res.render("links/edit", { link: links[0] });
});

router.post("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { title, url, description } = req.body;
  const newLinkEdit = {
    title,
    url,
    description,
  };
  await pool.query("UPDATE links set ? WHERE id=?", [newLinkEdit, id]);
  //req.flash('success','Link updated successfully');
  //alert('Link updated successfully');
  notifier.notify({
    title: 'Id: ' + [id],
    message: 'Link updated successfully!'
  });
  //res.send("Received");
  //console.log(newLinkEdit);
  res.redirect("/links");
});

module.exports = router;
