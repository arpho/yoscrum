
/*
 * GET home page.
 */
var async = require('async')
var debug = function(s){
  console.log(s)
}
/**
 * copia il campo @rid  in rid senza # in una lista di oggetti
 * @method stripHash
 * @param [obj]
 * @return null
 * */
stripHash = function(l){
  for (var i=0;i<l.length;i++){
   l[i].rid =l[i]['@rid'].substring(1) 
  }
}
view_feature = function(req,res){
  rid = req.params.id.substring(1) //rimuovo :
  var query = "select from feature where @rid=#" +  rid
  module.db.command(query,function(e,f){
     if(e){return conasole.dir(e)}
     f = f[0]
     f.rid = f['@rid'].substring(1)
     debug(f)
     res.render('feature_view',{title:'visulizzo feature '+f.feature,feature:f})
  })
}
modify_feature = function(req,res){
  var rid = req.body.feature_id
  delete req.body.feature_id
  debug(req.body)
  res.send(200)
}
new_customer_form = function(req,res){
  res.render('new_customer',{title:'inserisci un nuovo utente'})
  }
customers_list = function(req,res){
  debug('customers_list')
    query = "select from customer order by data_inserimento desc"
    module.db.command(query,function(err,out){
      if(err){return console.dir(err)}
      debug(out)
      //devo normalizzare i customer espongo @rid come rid
    for (var i=0;i<out.length;i++){
      out[i].rid =':' + out[i]['@rid'].substring(1)}
      //res.render("customers_list",{customer:out,title:'lista clienti'})
        res.send(out,200)
    })
  }
new_project_form = function(req,res){
  query = "select from customer order by nome asc"
  module.db.command(query,function(err,c){
    if(err){console.dir(err)}
    debug(c)
    //devo normalizzare i customer espongo @rid come rid
    for (var i=0;i<c.length;i++){
      c[i].rid= c[i]['@rid']}
  res.render("new_project",{title:'inserisci un nuovo progetto',customer:c})
    
  })
  }
projects_list = function(req,res){
  debug('projectlist')
  var query = "select @rid as rid,nome,release,codice,data_inserimento,in_requires.nome as customer from project order by data_inserimento desc, nome asc"
  module.db.command(query,function(e,o){
    
    if(e){return console.dir(e)}
    for (var i =0;i<o.length;i++){
        o[i].rid = o[i].rid.substring(1) // rimuovo #
      }
    debug('progetti trovati')
    debug(o)
    res.send(o,200)
    //res.render("project_list",{title:'progetti inseriti',projects:o})
    }) 
}
/**esegue il parsing su una stringa del tipo :14:5!15:6
 * e ne estrae i due rid
 * @method ExtractIds
 * @param string nel for mato rid|rid
 * @return [string,string]
 * */
function extractIds(s){
  s = s.substring(1) // rimuovo :
  var o1 = ''
  var o2 = ''
  var out = [o1,o2]
  var j = 0
  for (var i=0;i<s.length;i++){
    if (s[i]!='|'){
      out[j] += s[i]
    }
    else{
      j = 1
    }
  }
  
  return out
}
view_customer = function(req,res){
    debug( req.params.id)
  var rid = '#' + req.params.id.substring(2);
    debug('cerco un cliente')
    debug(rid)
  var async = require('async')
  async.parallel([
    function(callback){
      query = "select from customer where @rid= " + rid
      debug(query)
      module.db.command(query,function(e,o){if(e){return console.dir(e)} callback(e,o)})
  },
  function(callback){
    query ="select in_requires.nome ,@rid,nome,codice,release,completato,deadLine from project where in_requires=" + rid
    debug(query)
      module.db.command(query,function(e,o){if(e){return console.dir(e)} callback(e,o)})
  },
  function(callback){
    query = "select from telephone where in_answers =" +rid
    debug(query)
    module.db.command(query,function(e,o){if(e){return console.dir(e)} callback(e,o)})
  }
  ], function(e, results){
      if(e){return console.dir(e)}
      out = results[0][0]
      out.projects = results[1]
      out.telephones = results[2]
      out.emails = [{descrizione:'stub1',mail:'4555'},{descrizione:'stub2',mail:'777'}]
      debug(results)
      debug('customer')
      debug(out)
      //aggiungo il campo rid a customer
      results[0][0].rid = rid.substring(1)
      //res.render("customer_view",{customer:results[0][0]})
      res.send(out,200)
    })
  debug(rid)
  /*module.db.command(query,function(e,o){if(e){return console.dir(e)}
  debug(o)
  
  })*/
}
add_payment = function(req,res){
  debug(req.body)
  var p  = req.body
  var project_id  = p.project_id
  delete p.project_id
  var customer_id = p.customer_id
  delete p.customer_id
  p.amount = parseFloat(p.amount)
  p.date = new Date()
  debug(p)
  module.db.createVertex(p,{"class":"Payment"},function(e,pa){
    if(e){return console.dir(e)}
    var query = "create edge pays from #"+customer_id +" to " + pa['@rid']
    module.db.command(query,function(e,o){
      if(e){return console.dir(e)}
      debug("creato arco customer pays")
      var query = "create edge refers from " +pa['@rid'] + " to #" +project_id
      module.db.command(query,function(e,o){
        if(e){return console.dir(e)}
        debug("creato arco payment refers ")
        res.redirect('/api/project/:'+ project_id)
      }) 
    
})
  })
}
addTelephone = function(req,res){
    var customer_id = req.params.id.substring(1)
    res.render("new_telephone",{title:'aggiungi telefono',customer_id:customer_id})
  }
new_project  = function(req,res){
  project = {
    nome : req.body.nome,
    release : req.body.release,
    codice : req.body.codice,
    descrizione :req.body.descrizione,
    prezzo_stimato:req.body.prezzo_stimato,
    completato: false,
    approvato:false,
    deadLine: req.body.deadline,
    
    wiki :req.body.wiki,
    data_inserimento : new Date()
  }
  debug(project)
  var customer = req.body.customer
  // cerco il cliente
  debug(customer)
  queryCustomer = "select from customer where @rid =" +customer
  debug(queryCustomer)
  module.db.command(queryCustomer,function(e,c){
    debug(c)
    if(e|| c.length==0){return console.dir(e)}
    debug('customer found')
    c = c[0] // estraggo l'utente
    debug(c)
    //creo il progetto
    module.db.createVertex(project,{"class":"Project"},function(e,p){
      if(e){return console.dir(e)}
      debug('progetto creato')
      debug(p)
      var query = "create edge requires from "+ c['@rid'] + " to " + p['@rid']
      debug(query)
      module.db.command(query,function(e,o){if(e){return console.dir(e)}
        debug('creato lato requires')
        debug(o)
      })
    })
    res.redirect('/api/projects_list')
  })
}
new_payment = function(req,res){
  var ids = req.params.id
  debug(ids)
  Ids = extractIds(ids)
  debug(Ids)
  res.render('new_payment',{title: 'Nuovo Pagamento',Project_id:Ids[0],Customer_id:Ids[1]})
}
new_customer = function(req,res){
  customer = req.body
  customer.data_inserimento = new Date()
  module.db.createVertex(customer,{"class":"Customer"},function(err,c){
    //res.redirect("/api/customers_list")
      res.redirect('/#/customers')
  })
  
}
push_telephone = function(req,res){
  var customer_id = req.body.customer_id
  var description = req.body.description
  var number = req.body.number
  var telephone = {numero:number,descrizione:description}
  //debug(customer_id)
  module.db.createVertex(telephone,{"class":"Telephone"},function(e,p){
      if(e){return console.dir(e)}
      debug('telefono creato')
      debug(p)
      var query = "create edge answers from  #" + customer_id + " to " + p['@rid']
      debug(query)
      module.db.command(query,function(e,o){if(e){return console.dir(e)}
        debug('creato lato requires')
        debug(o)
      })
    })
  res.redirect("/api/customer/:"+customer_id)
  }
//debug(constants)
/**controlla che le classi usate dall'applicazione siano presenti nel db e se neccessario le crea*/
function ensureSchemaIsSetup(callback) {
    if (module.db.getClassByName("requires") === null) {
        module.db.createClass("requires", "OGraphEdge", callback);
    }
    if (module.db.getClassByName("Customer") === null) {
        module.db.createClass("Customer", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("answers") === null) {
        module.db.createClass("answers", "OGraphEdge", callback);
    }
    if (module.db.getClassByName("Telephone") === null) {
        module.db.createClass("Telephone", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("Project") === null) {
        module.db.createClass("Project", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("lives") === null) {
        module.db.createClass("lives", "OGraphEdge", callback);
    }
    if (module.db.getClassByName("Address") === null) {
        module.db.createClass("Address", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("recives") === null) {
        module.db.createClass("recives", "OGraphEdge", callback);
    }
    if (module.db.getClassByName("Email") === null) {
        module.db.createClass("Email", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("needs") === null) {
        module.db.createClass("needs", "OGraphEdge", callback);
    }
    
    if (module.db.getClassByName("Payment") === null) {
        module.db.createClass("Payment", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("Refers") === null) {
        module.db.createClass("Refers", "OGraphVertex", callback);
    }
    if (module.db.getClassByName("Pays") === null) {
        module.db.createClass("Pays", "OGraphEdge", callback);
    }
    
    if (module.db.getClassByName("Feature") === null) {
        module.db.createClass("Feature", "OGraphVertex", callback);
    }
}

exports.init = function(orient, callback) {
    module.db = orient;
    
    ensureSchemaIsSetup(callback);
};
exports.index = function(req, res){
     res.render('index.html', { title: 'Express-based AngularJS app' });
};

exports.home = function(req,res){
  res.redirect('/')
}
exports.new_customer = new_customer

exports.push_telephone = push_telephone
exports.new_project = new_project

push_feature = function(req,res){
  var project_id = req.body.project_id
  var feature = req.body.feature
  var note = req.body.note
  var implemented = req.body.implemented
  debug(project_id)
  
  var feature = {
    feature : feature,
    note:note,
    implemented:implemented,
    request_date: new Date()
  }
  debug(feature)
  module.db.createVertex(feature,{"class":"Feature"},function(e,p){
      if(e){return console.dir(e)}
      debug('feature creato')
      debug(p)
      var query = "create edge needs from  #" + project_id + " to " + p['@rid']
      debug(query)
      module.db.command(query,function(e,o){if(e){return console.dir(e)}
        debug('creato lato needs')
        debug(o)
      })
    })
  res.redirect('/api/project/:'+project_id)
  }
addFeature = function(req,res){
    var project_id = req.params.id.substring(1)
    debug('aggiungo feature a')
    debug(project_id)
    res.render("new_feature",{title:' Aggiungi Feature',project_id:project_id,implemented:'0'})
}
view_project = function(req,res){
    var rid = '#' + req.params.id.substring(1)
    debug(rid)
    async.parallel([
      function(callback){
        var query = 'select nome,@rid as rid, release, codice, in_requires.nome as customer,in_requires as customer_id,wiki,descrizione,deadLine,completato,data_inserimento,prezzo_stimato,consegnato from project where @rid =' + rid
        module.db.command(query,function(e,o){
          if(e) {return console.dir(e)}
          debug(o)
          callback(e,o)
          })
      },
      function(callback){
        var query = "select from feature where in_needs=" + rid
        debug(query)
        module.db.command(query,function(e,o){
          if(e){return console.dir(e)}
          callback(e,o)
          
          })
      },
      function(callback){
        var query = "select from payment where out_Refers="+rid
        module.db.command(query,function(e,o){
          if(e){return console.dir(e)}
          callback(e,o)
          })
      },
      function(callback){
        var query = "select sum(amount) from payment where out_Refers =" +rid
        module.db.command(query,function(e,t){
          if(e){return console.dir(e)}
          callback(e,t)
          })
      }
    ],function(err,results){
      if(err){ debug(err)
        return console.dir(err)}
      debug('results')
      debug(results)
      p = results[0][0] // progetto
      p.customer_id = p.customer_id.substring(1) // rimuovo #
      p.backlog = results[1]
      p.payments = results[2]
      debug('totale')
      debug(results[3])
      p.total = 0 // in ogni caso mostro una cifra
      if(results[3].length>0){
        p.total = results[3][0].sum
      }
      debug('total')
      debug(p.total)
      debug('features')
      stripHash(p.backlog)
      debug(p)
      
      p.rid = p.rid.substring(1) // rimuovo #
      //res.render('project_view',{title:'visualizza '+ p.nome + ' ' + p.codice,project:p})
      res.send(p,200)
      })
    query = 'select nome,@rid as rid, release, codice, in_requires.nome as customer,in_requires as customer_id from project where @rid =' + rid
    /*module.db.command(query,function(e,p){
        if(e){return console.dir(e)}
        p[0].customer_id = p[0].customer_id.substring(1)
        debug(p)
        res.render('project_view',{title:'visualizza '+ p[0].nome + ' ' + p[0].codice,project:p[0]})
      })*/
    
  }
  exports.new_payment = new_payment
  exports.modify_feature = modify_feature
  exports.add_payment = add_payment
exports.view_feature = view_feature
exports.addTelephone = addTelephone
  exports.addFeature = addFeature
exports.view_customer = view_customer
exports.push_feature = push_feature
exports.view_project =  view_project
exports.projects_list = projects_list
exports.new_project_form = new_project_form
exports.new_customer_form = new_customer_form 
exports.customers_list =  customers_list 
 
