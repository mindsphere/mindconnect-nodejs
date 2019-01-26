pipeline {
  agent {
    docker {
      image 'node'
      args '''-v /home/sn0wcat/mc:/.mc
pwd
cp -a /.mc/ . '''
    }

  }
  stages {
    stage('Build') {
      steps {
        sh '''npm install
ls -la .mc'''
      }
    }
  }
}