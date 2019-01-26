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
mkdir .mc
cp -a /.mc/. .mc/
ls -la
ls -la .mc/

'''
      }
    }
  }

  post {
      always {
          sh '''
          ls -la
          '''
      }
  }
}