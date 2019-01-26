pipeline {
  agent {
    docker {
      image 'node'
      args '-v /home/sn0wcat/mc:/.mc'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh '''pwd

cp -a /.mc/. .

ls -la
ls -la .mc/'''
      }
    }
  }
}