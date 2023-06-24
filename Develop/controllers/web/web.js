const authenticate = require('../../middleware/authenticate');
const { Project, User } = require('../../models');

const router = require('express').Router();



//  / -- list of projects
router.get('/', (req, res) => {

  Project.findAll({
    include: [
      {model: User}
    ]
  })
    .then((projects) => {
      res.render('index', {
        projects: projects.map((project) => project.get({ plain: true })),
        logged_in: req.session.logged_in,
      })
    }).catch((err) => {

      res.render('error')
    })
});


// /project/:id --- show a project
router.get('/project/:id', (req,res) => {

  Project.findByPk(req.params.id, {
    include: [
      {model: User},
    ]
  }).then((data) => {

    const project = data.get({plain: true});


    res.render('project', {
      logged_in: req.session.logged_in,
      project: project,
    })
  })
})

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res.render('login', {
        error: "Incorrect email or password, please try again"
      });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res.render('login', {
        error: "Incorrect email or password, please try again"
      });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.redirect('/profile');
      
    });

  } catch (err) {
    res.status(400).json(err);
  }

})


// /login -- show login form & sign up
router.get('/login', (req, res) => {
  res.render('login', {
    logged_in: req.session.logged_in,

  });
})

router.get('/signup', (req, res) => {
  res.render('signup', {
    logged_in: req.session.logged_in,

  });
})

router.post('/signup', async (req, res) => {

  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.redirect('/profile')
    });
  } catch (err) {
    res.render('signup', {
      error: "Something went wrong"
    });
  }
})


// /profile (protected)-- current user projects & create new project
// & delete project
router.use(authenticate);
router.get('/profile', (req, res) => {

  // need the current user
  User.findByPk(req.session.user_id, {
    include: [
      {model: Project}
    ]
  }).then((userData) => {
    res.render('profile', {
      logged_in: req.session.logged_in,
      user: userData.get({plain: true}),
    })

  })

  // need the current user project

})


router.post('/profile/projects/:id/delete', (req, res) => {
  Project.destroy({
    where: {
      id: req.params.id,
    }
  })

  // TODO: continue
  
})




module.exports = router;