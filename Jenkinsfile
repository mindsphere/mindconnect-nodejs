pipeline {
  options { disableConcurrentBuilds() }
  agent {
    docker {
      image 'node'
      args '-v /home/sn0wcat/mc:/.mc -v /home/sn0wcat/jenkins_artefacts/mindconnect_nodejs:/publish'
    }
  }
  stages {
    stage('Prepare') {
      steps {
        sh '''
        pwd
        mkdir .mc
        cp -a /.mc/. .mc/
        mkdir ~/.mc
        cp .mc/auth.json ~/.mc/
        mv .mc/private.key .
        cp .mc/2903bf15381646d3a8f4aeeff8d9bd29.json agentconfig.json
        cp .mc/68766a93af834984a8f8decfbeec961e.json agentconfig.rsa.json
        '''
      }
    }
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test-jenkins'
      }
    }
    stage('License') {
      steps {
        sh 'npm run license > license-checker.txt'
      }
    }
    stage('Package') {
      steps {
        sh '''
        npm pack --unsafe-perm
        '''
      }
    }
    stage('Archive Artifacts') {
      steps {
        archiveArtifacts '*.tgz'
        archiveArtifacts 'license-checker.txt'
      }
    }
  }
  environment {
    CI = 'true'
  }
  post {
    always {
      sh '''
          cp -rf .mc/*.json /.mc/
          '''
      junit '**/*.xml'

    }

  }
}
